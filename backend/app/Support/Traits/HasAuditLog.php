<?php

namespace App\Support\Traits;

use App\Models\AuditLog;

trait HasAuditLog
{
    protected static function bootHasAuditLog(): void
    {
        static::created(fn ($model) => static::logAudit('created', $model));
        static::updated(fn ($model) => static::logAudit('updated', $model));
        static::deleted(fn ($model) => static::logAudit('deleted', $model));
    }

    private static function logAudit(string $event, $model): void
    {
        try {
            AuditLog::create([
                'business_id'    => $model->business_id ?? app('current.business')?->id ?? null,
                'user_id'        => auth()->id(),
                'auditable_type' => get_class($model),
                'auditable_id'   => $model->id,
                'event'          => $event,
                'old_values'     => $event === 'updated' ? array_intersect_key($model->getOriginal(), $model->getChanges()) : null,
                'new_values'     => $event !== 'deleted' ? $model->getAttributes() : null,
                'meta'           => [
                    'ip'         => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error('Audit log creation failed: '.$e->getMessage());
        }
    }
}
