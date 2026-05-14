<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WorkSessionController extends Controller
{
    public function index()
    {
        return response('Worksnap dashboard placeholder.');
    }

    public function start(Request $request, $id = null)
    {
        return response()->json(['action' => 'start', 'id' => $id]);
    }

    public function pause(Request $request, $id = null)
    {
        return response()->json(['action' => 'pause', 'id' => $id]);
    }

    public function resume(Request $request, $id = null)
    {
        return response()->json(['action' => 'resume', 'id' => $id]);
    }

    public function stop(Request $request, $id = null)
    {
        return response()->json(['action' => 'stop', 'id' => $id]);
    }
}
