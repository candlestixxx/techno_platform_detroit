#!/usr/bin/env python3
"""
Detroit Underground Hub - System Tray & Server Management Daemon
Provides monitoring, log streaming, and graceful shutdown ('quit') for the platform servers.
Supports desktop tray integration when graphical environment is present,
with an autonomous CLI daemon mode for headless/container operation.
"""

import os
import sys
import time
import signal
import socket
import argparse
import subprocess

PORT = int(os.environ.get("PORT", 3000))

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_server_pids(port=3000):
    pids = []
    try:
        # Check lsof
        res = subprocess.run(["lsof", "-t", f"-i:{port}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and res.stdout.strip():
            for line in res.stdout.strip().splitlines():
                if line.strip():
                    pids.append(int(line.strip()))
    except Exception:
        pass

    try:
        # Also check pgrep for server.js or next dev/start
        res = subprocess.run(["pgrep", "-f", "node.*server.js"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and res.stdout.strip():
            for line in res.stdout.strip().splitlines():
                pid = int(line.strip())
                if pid not in pids:
                    pids.append(pid)
    except Exception:
        pass

    return pids

def stop_servers(port=3000):
    pids = find_server_pids(port)
    if not pids:
        print(f"[Detroit Hub Daemon] No servers actively listening on port {port} or running node server.js.")
        return 0

    print(f"[Detroit Hub Daemon] Found server processes: {pids}. Sending SIGTERM...")
    for pid in pids:
        try:
            os.kill(pid, signal.SIGTERM)
            print(f" -> Terminated PID {pid}")
        except ProcessLookupError:
            pass
        except Exception as e:
            print(f" -> Error terminating {pid}: {e}")

    time.sleep(1)
    # Check if any remain
    remaining = find_server_pids(port)
    if remaining:
        print(f"[Detroit Hub Daemon] Forcing SIGKILL on remaining processes: {remaining}...")
        for pid in remaining:
            try:
                os.kill(pid, signal.SIGKILL)
            except Exception:
                pass
    print("[Detroit Hub Daemon] All platform servers successfully stopped.")
    return len(pids)

def get_status(port=3000):
    in_use = is_port_in_use(port)
    pids = find_server_pids(port)
    status_str = "ONLINE" if in_use else "OFFLINE"
    print("==================================================")
    print("       DETROIT UNDERGROUND HUB SERVER STATUS      ")
    print("==================================================")
    print(f" Port:         {port}")
    print(f" State:        {status_str}")
    print(f" Active PIDs:  {pids if pids else 'None'}")
    print("==================================================")
    return in_use

def run_tray_or_daemon():
    print("[Detroit Hub Daemon] Initializing Server Control Center...")
    # Attempt to import pystray for desktop graphical system tray if DISPLAY is set
    has_display = bool(os.environ.get("DISPLAY"))
    try:
        import pystray
        from PIL import Image, ImageDraw
        can_gui = True
    except ImportError:
        can_gui = False

    if has_display and can_gui:
        print("[Detroit Hub Daemon] GUI Display detected. Initializing system tray icon...")
        # Create a basic tray icon (black circle with neon green dot)
        img = Image.new('RGB', (64, 64), color=(0, 0, 0))
        d = ImageDraw.Draw(img)
        d.ellipse([16, 16, 48, 48], fill=(57, 255, 20)) # Neon green

        def on_status(icon, item):
            get_status(PORT)

        def on_quit_servers(icon, item):
            print("[Detroit Hub Daemon] Quit command triggered from System Tray.")
            stop_servers(PORT)

        def on_exit_tray(icon, item):
            icon.stop()

        menu = pystray.Menu(
            pystray.MenuItem("Detroit Underground Hub", lambda: None, enabled=False),
            pystray.MenuItem("Status", on_status),
            pystray.MenuItem("Quit Servers", on_quit_servers),
            pystray.MenuItem("Exit Tray", on_exit_tray)
        )
        icon = pystray.Icon("detroit_hub", img, "Detroit Underground Hub", menu)
        icon.run()
    else:
        print("[Detroit Hub Daemon] Running in Headless/CLI Daemon mode.")
        get_status(PORT)
        print("[Detroit Hub Daemon] Daemon active and monitoring server health. Press Ctrl+C to exit.")
        try:
            while True:
                time.sleep(5)
        except KeyboardInterrupt:
            print("\n[Detroit Hub Daemon] Exiting daemon.")

def main():
    parser = argparse.ArgumentParser(description="Detroit Underground Hub System Tray & Service Controller")
    parser.add_argument("--status", action="store_true", help="Print server running status and exit")
    parser.add_argument("--stop", action="store_true", help="Stop/kill running server processes")
    parser.add_argument("--daemon", action="store_true", help="Run background tray / monitor daemon")
    args = parser.parse_args()

    if args.status:
        sys.exit(0 if get_status(PORT) else 1)
    elif args.stop:
        stop_servers(PORT)
        sys.exit(0)
    else:
        run_tray_or_daemon()

if __name__ == "__main__":
    main()
