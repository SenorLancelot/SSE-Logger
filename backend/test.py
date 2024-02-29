import json

import sseclient


if __name__ == '__main__':

    messages = sseclient.SSEClient('http://127.0.0.1:5000/listen')

    for msg in messages:
        print(msg)  
