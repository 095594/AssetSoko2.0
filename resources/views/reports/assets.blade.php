@extends('reports.layout')

@section('content')
    <div class="summary">
        <h3>Assets Summary</h3>
        <p>Total Assets: {{ count($data) }}</p>
        <p>Active Assets: {{ $data->where('status', 'active')->count() }}</p>
        <p>Total Views: {{ $data->sum('views') }}</p>
        <p>Total Bids: {{ $data->sum('bids') }}</p>
    </div>

    <h3>Asset List</h3>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Views</th>
                <th>Bids</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $asset)
                <tr>
                    <td>{{ $asset['name'] }}</td>
                    <td>{{ ucfirst($asset['category']) }}</td>
                    <td>{{ $asset['views'] }}</td>
                    <td>{{ $asset['bids'] }}</td>
                    <td>{{ ucfirst($asset['status']) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Assets by Category</h3>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Total Views</th>
                <th>Total Bids</th>
            </tr>
        </thead>
        <tbody>
            @php
                $categories = $data->groupBy('category')->map(function($group) {
                    return [
                        'count' => $group->count(),
                        'views' => $group->sum('views'),
                        'bids' => $group->sum('bids'),
                    ];
                });
            @endphp
            @foreach($categories as $category => $stats)
                <tr>
                    <td>{{ ucfirst($category) }}</td>
                    <td>{{ $stats['count'] }}</td>
                    <td>{{ $stats['views'] }}</td>
                    <td>{{ $stats['bids'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection 