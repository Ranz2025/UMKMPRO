<?php

if (! function_exists('tenant_business_id')) {
    function tenant_business_id(): ?int
    {
        return auth()->user()?->business_id;
    }
}
