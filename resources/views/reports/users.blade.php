@extends('reports.layout')

@section('content')
    <div class="summary">
        <h3>Users Summary</h3>
        <p>Total Users: {{ count($data) }}</p>
        <p>Active Users: {{ $data->where('status', 'active')->count() }}</p>
        <p>Admin Users: {{ $data->where('is_admin', true)->count() }}</p>
    </div>

    <h3>User List</h3>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Admin</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $user)
                <tr>
                    <td>{{ $user['name'] }}</td>
                    <td>{{ $user['email'] }}</td>
                    <td>{{ ucfirst($user['role']) }}</td>
                    <td>{{ ucfirst($user['status']) }}</td>
                    <td>{{ $user['last_active'] ? $user['last_active']->format('Y-m-d H:i') : 'Never' }}</td>
                    <td>{{ $user['is_admin'] ? 'Yes' : 'No' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection 