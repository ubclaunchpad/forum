"""Script to manage requirements files."""
import subprocess
from pathlib import Path
import sys
from importlib.metadata import distributions

def get_top_level_packages():
    """Get directly installed packages (not dependencies)."""
    # Get all installed distributions
    dists = [dist.metadata['Name'] for dist in distributions()]
    
    # Use pip to get dependency tree
    result = subprocess.run(
        [sys.executable, '-m', 'pip', 'list', '--format=json'],
        capture_output=True,
        text=True
    )
    
    import json
    packages = json.loads(result.stdout)
    
    # Create requirements.in content
    req_packages = []
    for pkg in packages:
        name = pkg['name']
        version = pkg['version']
        # Skip pip, setuptools, and wheel
        if name.lower() not in ['pip', 'setuptools', 'wheel']:
            req_packages.append(f"{name}>={version}")
    
    return sorted(req_packages)

def create_requirements_files():
    """Create requirements.in and requirements.txt files."""
    # Ensure pip-tools is installed
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'pip-tools'], check=True)
    
    # Get packages
    packages = get_top_level_packages()
    
    # Write requirements.in
    with open('requirements.in', 'w') as f:
        for pkg in packages:
            f.write(f"{pkg}\n")
    
    print("Created requirements.in")
    
    # Generate requirements.txt using pip-compile
    subprocess.run([sys.executable, '-m', 'piptools', 'compile', 'requirements.in'], check=True)
    print("Created requirements.txt")

if __name__ == "__main__":
    create_requirements_files()