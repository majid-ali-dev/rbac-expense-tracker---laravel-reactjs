<?php

namespace App\Http\Controllers;

use App\Http\Requests\Notification\NotificationStoreRequest;
use App\Http\Requests\Notification\NotificationUpdateRequest;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(): JsonResponse
    {
        $notifications = $this->notificationService->getAll();

        return response()->json([
            'success' => true,
            'data' => NotificationResource::collection($notifications),
        ]);
    }

    public function store(NotificationStoreRequest $request): JsonResponse
    {
        $notification = $this->notificationService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Notification created successfully',
            'data' => new NotificationResource($notification->load('creator')),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $notification = $this->notificationService->findById($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new NotificationResource($notification->load('creator', 'reads.user')),
        ]);
    }

    public function update(NotificationUpdateRequest $request, int $id): JsonResponse
    {
        $updated = $this->notificationService->update($id, $request->validated());

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification = $this->notificationService->findById($id);

        return response()->json([
            'success' => true,
            'message' => 'Notification updated successfully. All members will see it again.',
            'data' => new NotificationResource($notification->load('creator')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->notificationService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully',
        ]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $marked = $this->notificationService->markAsRead($id);

        if (!$marked) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found or inactive',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }

    public function unread(): JsonResponse
    {
        $notifications = $this->notificationService->getUnreadForUser();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function read(): JsonResponse
    {
        $notifications = $this->notificationService->getReadForUser();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }
}
