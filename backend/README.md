# UBC Launchpad Forum Backend

## Setup Instructions

### 1. Install Python

- Download and install Python from [python.org](https://www.python.org/downloads/)
- Ensure Python is added to your system's PATH

### 2. Set up a Virtual Environment

#### For macOS and Linux:

1. Open a terminal
2. Navigate to the project directory
3. Create a virtual environment:
   ```
   python3 -m venv venv
   ```
4. Activate the virtual environment:
   ```
   source venv/bin/activate
   ```
5. Your terminal prompt should now show "(venv)" at the beginning, indicating that the virtual environment is active

Note: To deactivate the virtual environment when you're done, simply run:

#### For Windows:

1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Create a virtual environment:
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   ```
   .\venv\Scripts\activate
   ```
5. Your command prompt should now show "(venv)" at the beginning, indicating that the virtual environment is active

### 3. Installing Packages

To install new packages and automatically update the requirements files, please use the provided scripts:

#### For macOS and Linux:

1. Make sure you're in the project directory and your virtual environment is activated
2. Run the `pip_install.sh` script with the package name:

   ```
   ./pip_install.sh <package_name>
   ```

   For example: `./pip_install.sh fastapi`

3. This script will:
   - Install the package
   - Add it to `requirements.in`
   - Compile `requirements.in` to `requirements.txt` (if pip-compile is available)

#### For Windows:

1. Ensure you're in the project directory and your virtual environment is activated
2. Run the `pip_install.ps1` script with the package name:

   ```
   .\pip_install.ps1 <package_name>
   ```

   For example: `.\pip_install.ps1 fastapi`

3. This script will:
   - Install the package
   - Add it to `requirements.in`
   - Compile `requirements.in` to `requirements.txt` (if pip-compile is available)

Note: If pip-compile is not found, you'll need to install pip-tools to compile requirements.txt.
