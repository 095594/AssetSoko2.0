<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Bid;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reports/Index', [
            'reports' => [
                'sales' => $this->getSalesData(),
                'users' => $this->getUsersData(),
                'assets' => $this->getAssetsData(),
            ]
        ]);
    }

    public function sales()
    {
        $sales = Order::with(['asset', 'buyer'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'date' => $order->created_at,
                    'asset' => $order->asset ? $order->asset->name : 'N/A',
                    'buyer' => $order->buyer ? $order->buyer->name : 'N/A',
                    'amount' => $order->total_amount,
                    'status' => $order->status,
                ];
            });

        return response()->json($sales);
    }

    public function users()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_admin' => $user->is_admin,
                    'status' => $user->status,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($users);
    }

    public function assets()
    {
        $assets = Asset::withCount(['bids', 'views'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'category' => $asset->category,
                    'views' => $asset->views_count,
                    'bids' => $asset->bids_count,
                    'status' => $asset->status,
                ];
            });

        return response()->json($assets);
    }

    public function export($type, $format)
    {
        $data = match ($type) {
            'sales' => $this->getSalesData(),
            'users' => $this->getUsersData(),
            'assets' => $this->getAssetsData(),
            default => throw new \Exception('Invalid report type'),
        };

        return match ($format) {
            'pdf' => $this->exportToPdf($type, $data),
            'excel' => $this->exportToExcel($type, $data),
            default => throw new \Exception('Invalid export format'),
        };
    }

    private function getSalesData()
    {
        $startDate = Carbon::now()->subDays(7);
        
        $dailySales = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('date')
            ->get()
            ->map(function ($sale) {
                return [
                    'date' => $sale->date,
                    'total' => $sale->total,
                ];
            });

        $categorySales = Order::where('orders.status', 'completed')
            ->join('assets', 'orders.asset_id', '=', 'assets.id')
            ->select('assets.category', DB::raw('COUNT(*) as count'))
            ->groupBy('assets.category')
            ->get()
            ->map(function ($sale) {
                return [
                    'category' => $sale->category,
                    'count' => $sale->count,
                ];
            });

        $recentSales = Order::with(['asset', 'buyer'])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'date' => $order->created_at,
                    'asset' => $order->asset ? $order->asset->name : 'N/A',
                    'buyer' => $order->buyer ? $order->buyer->name : 'N/A',
                    'amount' => $order->total_amount,
                    'status' => $order->status,
                ];
            });

        return [
            'daily' => $dailySales,
            'byCategory' => $categorySales,
            'recent' => $recentSales,
        ];
    }

    private function getUsersData()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'last_active' => $user->last_active_at ?? $user->created_at,
                    'created_at' => $user->created_at
                ];
            });

        return $users->toArray();
    }

    private function getAssetsData()
    {
        $assets = Asset::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($asset) {
                return [
                    'name' => $asset->name,
                    'category' => $asset->category,
                    'price' => $asset->current_price ?? $asset->base_price ?? 0,
                    'status' => $asset->status,
                    'created_at' => $asset->created_at
                ];
            });

        return $assets->toArray();
    }

    private function exportToPdf($type, $data)
    {
        try {
            $viewData = [
                'title' => ucfirst($type) . ' Report',
                'dateRange' => request('dateRange', 'week')
            ];

            switch ($type) {
                case 'sales':
                    $viewData['data'] = $data;
                    break;
                case 'users':
                    $viewData['data'] = is_array($data) ? $data : $data->toArray();
                    break;
                case 'assets':
                    $viewData['data'] = is_array($data) ? $data : $data->toArray();
                    break;
                default:
                    throw new \Exception("Invalid report type: {$type}");
            }

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('admin.reports.' . $type, $viewData);
            return $pdf->download($type . '_report.pdf');
        } catch (\Exception $e) {
            \Log::error('PDF Export Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }

    private function exportToExcel($type, $data)
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers based on report type
        switch ($type) {
            case 'sales':
                $sheet->setCellValue('A1', 'Date');
                $sheet->setCellValue('B1', 'Asset');
                $sheet->setCellValue('C1', 'Buyer');
                $sheet->setCellValue('D1', 'Amount');
                $sheet->setCellValue('E1', 'Status');

                $row = 2;
                foreach ($data['recent'] as $sale) {
                    $sheet->setCellValue('A' . $row, $sale['date']);
                    $sheet->setCellValue('B' . $row, $sale['asset']);
                    $sheet->setCellValue('C' . $row, $sale['buyer']);
                    $sheet->setCellValue('D' . $row, $sale['amount']);
                    $sheet->setCellValue('E' . $row, $sale['status']);
                    $row++;
                }
                break;

            case 'users':
                $sheet->setCellValue('A1', 'Name');
                $sheet->setCellValue('B1', 'Email');
                $sheet->setCellValue('C1', 'Role');
                $sheet->setCellValue('D1', 'Status');
                $sheet->setCellValue('E1', 'Created At');

                $row = 2;
                foreach ($data as $user) {
                    $sheet->setCellValue('A' . $row, $user['name']);
                    $sheet->setCellValue('B' . $row, $user['email']);
                    $sheet->setCellValue('C' . $row, $user['role']);
                    $sheet->setCellValue('D' . $row, $user['status']);
                    $sheet->setCellValue('E' . $row, $user['created_at']);
                    $row++;
                }
                break;

            case 'assets':
                $sheet->setCellValue('A1', 'Name');
                $sheet->setCellValue('B1', 'Category');
                $sheet->setCellValue('C1', 'Views');
                $sheet->setCellValue('D1', 'Bids');
                $sheet->setCellValue('E1', 'Status');

                $row = 2;
                foreach ($data as $asset) {
                    $sheet->setCellValue('A' . $row, $asset['name']);
                    $sheet->setCellValue('B' . $row, $asset['category']);
                    $sheet->setCellValue('C' . $row, $asset['views']);
                    $sheet->setCellValue('D' . $row, $asset['bids']);
                    $sheet->setCellValue('E' . $row, $asset['status']);
                    $row++;
                }
                break;
        }

        // Auto-size columns
        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Create Excel file
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $type . '_report.xlsx"');
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output');
        exit;
    }
} 