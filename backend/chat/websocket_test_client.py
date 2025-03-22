"""
WebSocket Test Client for GMU Connect Chat

This script provides a simple way to test WebSocket connections to the chat server.
Run this script from the command line to connect to the chat service and interact with rooms.

Usage:
    python chat/websocket_test_client.py <token>

Example:
    python chat/websocket_test_client.py eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
"""

import sys
import json
import threading
import websocket
import requests
import time
from datetime import datetime
try:
    from colorama import init, Fore, Style
    # Initialize colorama
    init()
    COLOR_ENABLED = True
except ImportError:
    COLOR_ENABLED = False
    print("For colored output, install colorama: pip install colorama")

# Base URL for API requests
API_BASE_URL = "http://localhost:8000/api"

# Global variables
active_room_id = None
rooms = []
token = None
current_user = None


def print_colored(text, color=None, style=None):
    """Print colored text if colorama is available"""
    if COLOR_ENABLED and color:
        prefix = color
        if style:
            prefix = style + color
        suffix = Style.RESET_ALL
        print(f"{prefix}{text}{suffix}")
    else:
        print(text)


def print_header(text):
    """Print a header with emphasis"""
    if COLOR_ENABLED:
        print(f"\n{Fore.CYAN}{Style.BRIGHT}{text}{Style.RESET_ALL}")
    else:
        print(f"\n=== {text} ===")


def print_success(text):
    """Print a success message"""
    if COLOR_ENABLED:
        print(f"{Fore.GREEN}{text}{Style.RESET_ALL}")
    else:
        print(f"SUCCESS: {text}")


def print_error(text):
    """Print an error message"""
    if COLOR_ENABLED:
        print(f"{Fore.RED}{text}{Style.RESET_ALL}")
    else:
        print(f"ERROR: {text}")


def print_info(text):
    """Print an informational message"""
    if COLOR_ENABLED:
        print(f"{Fore.BLUE}{text}{Style.RESET_ALL}")
    else:
        print(f"INFO: {text}")


def print_warning(text):
    """Print a warning message"""
    if COLOR_ENABLED:
        print(f"{Fore.YELLOW}{text}{Style.RESET_ALL}")
    else:
        print(f"WARNING: {text}")


def print_message(sender, message, timestamp=None):
    """Print a chat message with formatting"""
    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            time_str = dt.strftime("%H:%M:%S")
        except:
            time_str = timestamp
    else:
        time_str = datetime.now().strftime("%H:%M:%S")

    if COLOR_ENABLED:
        if current_user and sender.get('username') == current_user.get('username'):
            # My message
            print(f"{Fore.GREEN}[{time_str}] {sender.get('username')}: {message}{Style.RESET_ALL}")
        else:
            # Other's message
            print(f"{Fore.BLUE}[{time_str}] {sender.get('username')}: {message}{Style.RESET_ALL}")
    else:
        print(f"[{time_str}] {sender.get('username')}: {message}")


def get_current_user_from_token():
    """Extract user information from the JWT token"""
    global current_user
    try:
        # We'll get the user info from the first room response
        # This avoids making an extra API call since the user info
        # will be included in the room data
        print_info("User info will be extracted from room data")
        return None
    except Exception as e:
        print_error(f"Error processing token: {str(e)}")
        return None


def fetch_rooms():
    """Fetch all rooms the user is a member of"""
    global rooms, current_user
    try:
        response = requests.get(
            f"{API_BASE_URL}/rooms/",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            rooms = response.json()
            print_success(f"Fetched {len(rooms)} rooms")

            # Extract current user info from the first room if available
            if not current_user and rooms and len(rooms) > 0:
                # Look for the current user in the members list
                # The current user is typically the one that's not the other user in a DM
                for room in rooms:
                    if not room.get('is_group') and room.get('members'):
                        # In a DM, find the member that's not the other user
                        for member in room.get('members', []):
                            if member.get('user', {}).get('username') != room.get('display_name'):
                                current_user = member.get('user', {})
                                print_success(f"Logged in as: {current_user.get('username')}")
                                break
                    if current_user:
                        break

            return rooms
        else:
            print_error(f"Failed to fetch rooms: {response.status_code}")
            return []
    except Exception as e:
        print_error(f"Error fetching rooms: {str(e)}")
        return []


def fetch_room_messages(room_id):
    """Fetch messages for a specific room"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/rooms/{room_id}/messages/",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            data = response.json()
            messages = data.get('results', [])
            print_success(f"Fetched {len(messages)} messages")

            # Print the last 10 messages in chronological order
            if messages:
                print_header("Recent Messages")
                for message in messages:
                    print_message(
                        message.get('sender', {'username': 'Unknown'}),
                        message.get('content', ''),
                        message.get('timestamp')
                    )
            return messages
        else:
            print_error(f"Failed to fetch messages: {response.status_code}")
            return []
    except Exception as e:
        print_error(f"Error fetching messages: {str(e)}")
        return []


def display_rooms():
    """Display all rooms with their IDs"""
    if not rooms:
        print_warning("No rooms available")
        return

    print_header("Available Rooms")
    for i, room in enumerate(rooms):
        room_type = "Group" if room.get('is_group') else "DM"
        unread = " (unread)" if room.get('unread') else ""
        active = " (active)" if active_room_id and room.get('id') == active_room_id else ""

        if COLOR_ENABLED:
            if active:
                print(f"{Fore.GREEN}{i+1}. [{room_type}] {room.get('display_name')}{unread}{active}{Style.RESET_ALL}")
            elif unread:
                print(f"{Fore.YELLOW}{i+1}. [{room_type}] {room.get('display_name')}{unread}{active}{Style.RESET_ALL}")
            else:
                print(f"{i+1}. [{room_type}] {room.get('display_name')}{unread}{active}")
        else:
            print(f"{i+1}. [{room_type}] {room.get('display_name')}{unread}{active}")


def on_message(ws, message):
    """Handle incoming WebSocket messages from the consumer and display them"""
    global active_room_id

    try:
        data = json.loads(message)
        message_type = data.get('type')

        if message_type == 'new_message':
            # Handle new chat message
            if data.get('room_id') == active_room_id:
                print_message(
                    data.get('sender', {'username': 'Unknown'}),
                    data.get('content', ''),
                    data.get('timestamp')
                )
            else:
                # Message in another room
                room_name = next((r.get('display_name') for r in rooms if r.get('id') == data.get('room_id')), "Unknown Room")
                print_info(f"New message in {room_name} from {data.get('sender', {}).get('username', 'Unknown')}")

                # Mark room as unread in our local data
                for room in rooms:
                    if room.get('id') == data.get('room_id'):
                        room['unread'] = True
                        break

        elif message_type == 'room_update':
            # Handle room update
            room_data = data.get('room', {})
            print_info(f"Room {room_data.get('id', -1)} was updated with a new name '{room_data.get('display_name')}'")

            # Update room in our local data
            for i, room in enumerate(rooms):
                if room.get('id') == room_data.get('id'):
                    rooms[i] = room_data
                    break

        elif message_type == 'added_to_room':
            # Handle being added to a room
            room_data = data.get('data', {})
            print_success(f"You were added to room '{room_data.get('display_name')}'")

            # Add room to our local data
            if not any(r.get('id') == room_data.get('id') for r in rooms):
                rooms.append(room_data)

        elif message_type == 'removed_from_room':
            # Handle being removed from a room
            room_id = data.get('data')
            left = data.get('left', False)

            # Find room name before removing
            room_name = next((r.get('display_name') for r in rooms if r.get('id') == room_id), "Unknown Room")
            print_warning(f"You were removed from room '{room_name}'" if not left else f"You left room '{room_name}'")

            # Remove room from our local data
            rooms[:] = [r for r in rooms if r.get('id') != room_id]

            # If this was the active room, clear it
            if active_room_id == room_id:
                active_room_id = None
                print_warning("You are no longer in the active room")

        elif message_type == 'member_added':
            # Handle member added to a room
            if data.get('room_id') == active_room_id:
                usernames = data.get('data', [])
                print_info(f"{' '.join(usernames)} were added to this room")

        elif message_type == 'member_removed':
            # Handle member removed from a room
            if data.get('room_id') == active_room_id:
                usernames = data.get('data', [])
                left = data.get('left', False)

                print_info(f"{' '.join(usernames)} were removed from this room" if not left else f"{' '.join(usernames)} left this room")

        else:
            # Unknown message type
            print_info(f"Received message of type: {message_type}")
            print(json.dumps(data, indent=2))

    except json.JSONDecodeError:
        print_error(f"Failed to parse message: {message}")
    except Exception as e:
        print_error(f"Error handling message: {str(e)}")


def on_error(ws, error):
    """
    Handle WebSocket connection errors
    """
    print_error(f"WebSocket error: {error}")


def on_close(ws, close_status_code, close_msg):
    """
    Handle WebSocket connection closure
    """
    print_warning(f"Connection closed: {close_status_code} - {close_msg}")
    print_info("Attempting to reconnect in 3 seconds...")
    time.sleep(3)
    connect_websocket()


def on_open(ws):
    """Handle successful WebSocket connection and start input thread"""
    print_success("WebSocket connection established")

    # If we have an active room, join it
    if active_room_id:
        print_info(f"Joining room {active_room_id}...")
        ws.send(json.dumps({
            'type': 'join_room',
            'room_id': active_room_id
        }))


def connect_websocket():
    """Connect to the WebSocket server"""
    global ws

    # Connect to WebSocket
    ws = websocket.WebSocketApp(
        f"ws://localhost:8000/ws/chat/?token={token}",
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )

    # Start WebSocket connection in a separate thread
    websocket_thread = threading.Thread(target=ws.run_forever)
    websocket_thread.daemon = True
    websocket_thread.start()

    return ws


def select_room():
    """Select a room to join"""
    global active_room_id

    display_rooms()

    try:
        choice = input("\nEnter room number (or 0 to refresh list): ")
        if choice == '0':
            fetch_rooms()
            return select_room()

        index = int(choice) - 1
        if 0 <= index < len(rooms):
            room = rooms[index]
            active_room_id = room.get('id')
            print_success(f"Selected room: {room.get('display_name')}")

            # Join room via WebSocket
            if ws and ws.sock and ws.sock.connected:
                ws.send(json.dumps({
                    'type': 'join_room',
                    'room_id': active_room_id
                }))

                # Mark room as read in our local data
                for r in rooms:
                    if r.get('id') == active_room_id:
                        r['unread'] = False
                        break

            # Fetch messages for this room
            fetch_room_messages(active_room_id)
            return True
        else:
            print_error("Invalid room number")
            return False
    except ValueError:
        print_error("Please enter a number")
        return False
    except Exception as e:
        print_error(f"Error selecting room: {str(e)}")
        return False


def send_message(message):
    """Send a message to the active room"""
    if not active_room_id:
        print_error("No active room selected")
        return False

    if not message:
        print_error("Message cannot be empty")
        return False

    try:
        ws.send(json.dumps({
            'type': 'message',
            'room_id': active_room_id,
            'content': message
        }))
        return True
    except Exception as e:
        print_error(f"Error sending message: {str(e)}")
        return False


def create_room():
    """Create a new room"""
    try:
        name = input("Enter room name: ")
        if not name:
            print_error("Room name cannot be empty")
            return False

        usernames_input = input("Enter comma-separated usernames to add: ")
        if not usernames_input:
            print_error("You must specify at least one username")
            return False

        usernames = [u.strip() for u in usernames_input.split(',')]

        response = requests.post(
            f"{API_BASE_URL}/rooms/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "name": name,
                "is_group": True if len(usernames) > 1 else False,
                "member_usernames": usernames
            }
        )

        if response.status_code == 201:
            room = response.json()
            print_success(f"Room created: {room.get('display_name')}")

            # Add to our local list and refresh
            fetch_rooms()
            return True
        else:
            print_error(f"Failed to create room: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error creating room: {str(e)}")
        return False


def add_member():
    """Add a member to the active room"""
    if not active_room_id:
        print_error("No active room selected")
        return False

    try:
        usernames_input = input("Enter comma-separated usernames to add: ")
        if not usernames_input:
            print_error("You must specify at least one username")
            return False

        usernames = [u.strip() for u in usernames_input.split(',')]

        response = requests.post(
            f"{API_BASE_URL}/rooms/{active_room_id}/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "action": "add",
                "usernames": usernames
            }
        )

        if response.status_code == 200:
            return True
        else:
            print_error(f"Failed to add member: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error adding member: {str(e)}")
        return False


def remove_member():
    """Remove a member from the active room"""
    if not active_room_id:
        print_error("No active room selected")
        return False

    try:
        usernames_input = input("Enter comma-separated usernames to add: ")
        if not usernames_input:
            print_error("You must specify at least one username")
            return False

        usernames = [u.strip() for u in usernames_input.split(',')]

        response = requests.post(
            f"{API_BASE_URL}/rooms/{active_room_id}/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "action": "remove",
                "usernames": usernames
            }
        )

        if response.status_code == 200:
            return True
        else:
            print_error(f"Failed to remove member: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error removing member: {str(e)}")
        return False


def leave_room():
    """Leave the active room"""
    global active_room_id, rooms

    if not active_room_id:
        print_error("No active room selected")
        return False

    try:
        confirm = input("Are you sure you want to leave this room? (y/n): ")
        if confirm.lower() != 'y':
            print_info("Operation cancelled")
            return False

        response = requests.delete(
            f"{API_BASE_URL}/rooms/{active_room_id}/leave/",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 200:
            return True
        else:
            print_error(f"Failed to leave room: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error leaving room: {str(e)}")
        return False


def rename_room():
    """Rename the active room"""
    if not active_room_id:
        print_error("No active room selected")
        return False

    try:
        new_name = input("Enter new room name: ")
        if not new_name:
            print_error("Room name cannot be empty")
            return False

        response = requests.put(
            f"{API_BASE_URL}/rooms/{active_room_id}/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"name": new_name}
        )

        if response.status_code == 200:
            return True
        else:
            print_error(f"Failed to rename room: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error renaming room: {str(e)}")
        return False


def show_help():
    """Show available commands"""
    print_header("Available Commands")
    commands = [
        ("help", "Show this help message"),
        ("rooms", "List available rooms"),
        ("select", "Select a room"),
        ("create", "Create a new room"),
        ("add", "Add a member to the current room"),
        ("remove", "Remove a member from the current room"),
        ("leave", "Leave the current room"),
        ("rename", "Rename the current room"),
        ("read", "Mark messages as read in the current room"),
        ("exit", "Exit the application")
    ]

    for cmd, desc in commands:
        if COLOR_ENABLED:
            print(f"{Fore.YELLOW}{cmd:<10}{Style.RESET_ALL} - {desc}")
        else:
            print(f"{cmd:<10} - {desc}")


def main_loop():
    """Main application loop"""
    global ws

    print_header("GMU Connect Chat Client")
    print_info("Type 'help' for available commands")

    # Fetch initial data
    get_current_user_from_token()
    fetch_rooms()

    while True:
        try:
            if active_room_id:
                room_name = next((r.get('display_name') for r in rooms if r.get('id') == active_room_id), "Unknown Room")
                prompt = f"\n[{room_name}] > "
            else:
                prompt = "\n> "

            user_input = input(prompt)

            if not user_input:
                continue

            if user_input.lower() == 'exit':
                print_info("Exiting...")
                break

            elif user_input.lower() == 'help':
                show_help()

            elif user_input.lower() == 'rooms':
                fetch_rooms()
                display_rooms()

            elif user_input.lower() == 'select':
                select_room()

            elif user_input.lower() == 'create':
                create_room()

            elif user_input.lower() == 'add':
                add_member()

            elif user_input.lower() == 'remove':
                remove_member()

            elif user_input.lower() == 'leave':
                leave_room()

            elif user_input.lower() == 'rename':
                rename_room()

            elif user_input.lower() == 'read':
                if active_room_id and ws and ws.sock and ws.sock.connected:
                    ws.send(json.dumps({
                        'type': 'mark_read',
                        'room_id': active_room_id
                    }))
                    print_success("Messages marked as read")
                else:
                    print_error("No active room or WebSocket connection")

            else:
                # Treat as a message if we're in a room
                if active_room_id:
                    send_message(user_input)
                else:
                    print_error("No active room selected. Type 'help' for commands.")

        except KeyboardInterrupt:
            print_info("\nExiting...")
            break
        except Exception as e:
            print_error(f"Error: {str(e)}")


if __name__ == "__main__":
    # Validate command line arguments
    if len(sys.argv) < 2:
        print("Usage: python test_websocket.py <token>")
        sys.exit(1)

    # Get token from command line
    token = sys.argv[1]

    # Connect to WebSocket
    ws = connect_websocket()

    # Start main application loop
    try:
        main_loop()
    finally:
        # Clean up
        if ws:
            ws.close()