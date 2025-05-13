import socket
import time
import keyboard

import socket

DRONE_IP = "192.168.1.1"
COMMAND_PORT = 5556

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

try:
    sock.sendto(b"AT*CONFIG=1\r", (DRONE_IP, COMMAND_PORT))
    print("Connected! The drone received a test packet.")
except Exception as e:
    print("Connection failed:", e)
    exit(1)

seq = 1

def send_command(command):
    """Send an AT command to the AR.Drone."""
    global seq
    message = f"AT*{command}={seq}\r"
    sock.sendto(message.encode(), (DRONE_IP, COMMAND_PORT))
    seq += 1

def takeoff():
    print("Taking Off!")
    send_command("REF=290718208")

def land():
    print("Landing...")
    send_command("REF=290717696")

def main():
    print("Press 't' to Take Off")
    print("Press 'l' to Land")
    print("Press 'q' to Quit\n")

    while True:
        try:
            if keyboard.is_pressed("t"):
                takeoff()
                time.sleep(0.5)
            elif keyboard.is_pressed("l"):
                land()
                time.sleep(0.5)
            elif keyboard.is_pressed("q"):
                print("❌ Exiting...")
                break
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()