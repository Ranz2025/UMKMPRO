<?php

namespace App\Support;

abstract class BaseDTO
{
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
