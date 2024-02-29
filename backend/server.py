import queue
import os
import flask
import threading
import time
from flask_cors import CORS, cross_origin
app = flask.Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'


class MessageAnnouncer:

    def __init__(self):
        self.listeners = []

    def listen(self):
        self.listeners.append(queue.Queue(maxsize=100))
        return self.listeners[-1]

    def announce(self, msg):
        for i in reversed(range(len(self.listeners))):
            try:
                self.listeners[i].put_nowait(msg)
            except queue.Full:
                del self.listeners[i]


announcer = MessageAnnouncer()


def format_sse(data: str, event=None) -> str:
    
    msg = f'data: {data}\n\n'
    if event is not None:
        msg = f'event: {event}\n{msg}'
    return msg



def monitor_file(filename):
    last_modified = os.path.getmtime(filename)
    
    with open(filename, 'r') as file:
        while True:
           
            modified_time = os.path.getmtime(filename)
            if modified_time > last_modified:
                print(f'File modified at {modified_time}')
                lines = file.readlines()
                for line in lines:
                    msg = format_sse(data=line.strip(), event='message')
                    announcer.announce(msg=msg)
                last_modified = modified_time

def start_file_monitoring(filename):
    thread = threading.Thread(target=monitor_file, args=(filename,), daemon=True)
    thread.start()




@app.route('/listen', methods=['GET'])
def listen():

    def stream():
        messages = announcer.listen()
        with open("log.txt", 'r') as file:
        
            lines = file.readlines()
            last_lines = lines[-10:]
            for line in last_lines:
                msg = format_sse(data=line.strip(), event='message')
                messages.put_nowait(msg)  
        while True:
            msg = messages.get() 
            yield msg

    return flask.Response(stream(), mimetype='text/event-stream')


if __name__ == '__main__':
    start_file_monitoring('log.txt')
    app.run(debug=True)