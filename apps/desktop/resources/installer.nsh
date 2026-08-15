!include "getProcessInfo.nsh"

Var pid

!macro customCheckAppRunning
  ${GetProcessInfo} 0 $pid $0 $1 $2 $3
  FileOpen $0 "$TEMP\ai.deepseek.harness.installing" w
  FileWrite $0 "$pid"
  FileClose $0
  !insertmacro IS_POWERSHELL_AVAILABLE
  !insertmacro _CHECK_APP_RUNNING
!macroend

!macro customInstall
  Delete "$TEMP\ai.deepseek.harness.installing"
  IfFileExists "$SYSDIR\ie4uinit.exe" 0 icon_refresh_done
  nsExec::Exec '"$SYSDIR\ie4uinit.exe" -ClearIconCache'
  Pop $0
  nsExec::Exec '"$SYSDIR\ie4uinit.exe" -show'
  Pop $0
  System::Call 'shell32::SHChangeNotify(i, i, i, i) (0x08000000, 0x0000, 0, 0)'
  icon_refresh_done:
!macroend
