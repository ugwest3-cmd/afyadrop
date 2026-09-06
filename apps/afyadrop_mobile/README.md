# AfyaDrop Android app

This is the Android-first Flutter client for AfyaDrop. It is the primary
product surface for clinicians across Africa. Lab and scan report reading is
planned as the next major clinical workflow.

## Run locally

Start the backend on port 4000, then run:

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000
```

`10.0.2.2` points an Android emulator at the host machine. Use the host LAN
address for a physical device.
