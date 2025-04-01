<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class AssetFilter
{
    public function apply(Builder $builder, array $filters): Builder
    {
        foreach ($filters as $name => $value) {
            if (method_exists($this, $name)) {
                $this->$name($builder, $value);
            }
        }
        return $builder;
    }

    protected function name(Builder $builder, $value)
    {
        $builder->where('name', 'like', '%' . $value . '%');
    }

    protected function category(Builder $builder, $value)
    {
        $builder->where('category', $value);
    }

    protected function min_price(Builder $builder, $value)
    {
        $builder->where(function($q) use ($value) {
            $q->where('current_price', '>=', $value)
              ->orWhere('base_price', '>=', $value);
        });
    }

    protected function max_price(Builder $builder, $value)
    {
        $builder->where(function($q) use ($value) {
            $q->where('current_price', '<=', $value)
              ->orWhere('base_price', '<=', $value);
        });
    }
}
