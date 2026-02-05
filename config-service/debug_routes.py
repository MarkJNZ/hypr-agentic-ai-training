
import sys
import os

print(f"CWD: {os.getcwd()}")
print(f"Sys Path: {sys.path}")

try:
    # Try importing as the app does
    from src.config_service.api import routers
    print(f"Successfully imported from src.config_service.api.routers")
    print(f"File location: {routers.__file__}")
    
    print("Registered Routes:")
    for route in routers.router.routes:
        print(f"- {route.path} {route.methods}")

except ImportError:
    print("Could not import from src.config_service.api.routers.")
    try:
        from config_service.api import routers
        print(f"Successfully imported from config_service.api.routers")
        print(f"File location: {routers.__file__}")
        print("Registered Routes:")
        for route in routers.router.routes:
            print(f"- {route.path} {route.methods}")
    except ImportError as e:
        print(f"ImportError: {e}")

