@extends('reports.layout')

@section('content')
    <div class="summary">
        <h3>Sales Summary</h3>
        <p>Total Sales: {{ count($data['recent']) }}</p>
        <p>Total Amount: ${{ number_format($data['recent']->sum('amount'), 2) }}</p>
        <p>Date Range: {{ $data['daily']->first()->date }} to {{ $data['daily']->last()->date }}</p>
    </div>

    <h3>Daily Sales</h3>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Total Sales</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['daily'] as $sale)
                <tr>
                    <td>{{ $sale->date }}</td>
                    <td>${{ number_format($sale->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Sales by Category</h3>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Number of Sales</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['byCategory'] as $category)
                <tr>
                    <td>{{ $category->category }}</td>
                    <td>{{ $category->count }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Recent Sales</h3>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Asset</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['recent'] as $sale)
                <tr>
                    <td>{{ $sale->created_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $sale->asset->name }}</td>
                    <td>{{ $sale->buyer->name }}</td>
                    <td>${{ number_format($sale->amount, 2) }}</td>
                    <td>{{ ucfirst($sale->status) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection 