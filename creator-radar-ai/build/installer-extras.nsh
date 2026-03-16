; installer-extras.nsh
; Custom NSIS additions for CreatorRadar AI installer.

!macro customHeader
  Name "CreatorRadar AI ${VERSION} Setup"
!macroend

!macro customInit
  ReadRegStr $0 HKLM \
    "SOFTWARE\Microsoft\Windows NT\CurrentVersion" "CurrentMajorVersionNumber"
  IntCmp $0 10 win10_ok win10_fail win10_ok
  win10_fail:
    MessageBox MB_OK|MB_ICONSTOP \
      "CreatorRadar AI requires Windows 10 or later.$\nPlease upgrade your operating system."
    Quit
  win10_ok:
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\CreatorRadar AI" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\CreatorRadar AI" "Version"     "${VERSION}"
!macroend

!macro customUninstall
  DeleteRegKey HKCU "Software\CreatorRadar AI"
  MessageBox MB_OK|MB_ICONINFORMATION \
    "CreatorRadar AI has been uninstalled.$\r$\n$\r$\n\
Your lead database has been preserved at:$\r$\n\
$APPDATA\CreatorRadar AI$\r$\n$\r$\n\
Delete this folder manually if you want to remove all data."
!macroend
