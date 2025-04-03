<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .date-range {
            font-size: 14px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .summary {
            margin-top: 30px;
        }
        .summary h3 {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{ $title }}</div>
        <div class="date-range">Date Range: {{ ucfirst($dateRange) }}</div>
    </div>

    <div class="summary">
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
                        <td>{{ \Carbon\Carbon::parse($sale['date'])->format('Y-m-d') }}</td>
                        <td>{{ $sale['asset'] }}</td>
                        <td>{{ $sale['buyer'] }}</td>
                        <td>Ksh {{ number_format($sale['amount'], 2) }}</td>
                        <td>{{ ucfirst($sale['status']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="summary">
        <h3>Sales by Category</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['byCategory'] as $category)
                    <tr>
                        <td>{{ $category['category'] }}</td>
                        <td>{{ $category['count'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="summary">
        <h3>Daily Sales</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['daily'] as $daily)
                    <tr>
                        <td>{{ $daily['date'] }}</td>
                        <td>Ksh {{ number_format($daily['total'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html> 