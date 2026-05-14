<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkSessionController extends Controller
{
    public function current()
    {
        return response()->json(['session' => 'current placeholder']);
    }

    public function start(Request $request)
    {
        return response()->json(['action' => 'start']);
    }

    public function pause($id)
    {
        return response()->json(['action' => 'pause', 'id' => $id]);
    }

    public function resume($id)
    {
        return response()->json(['action' => 'resume', 'id' => $id]);
    }

    public function stop($id)
    {
        return response()->json(['action' => 'stop', 'id' => $id]);
    }

    public function screenshot(Request $request)
    {
        return response()->json(['action' => 'screenshot']);
    }
}
