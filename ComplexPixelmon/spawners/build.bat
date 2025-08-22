@echo off
goto :build

:build
    cls
    call tsc
    if %errorlevel% == 0 (echo Compiled successfully! & echo.)

:ask
echo Press R to rebuild.
echo Press X to exit.
choice /C RX /N
if %errorlevel% == 1 goto :build
if %errorlevel% == 2 exit