from django.http import JsonResponse

def home_view(request):
    return JsonResponse({"message": "Welcome to the API! Use /port/ to check the port."})

def port_info(request):
    port = request.get_host().split(':')[-1]
    return JsonResponse({"message": f"Port is hosted on {port}"})
