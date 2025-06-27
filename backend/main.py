from vision550.app import ApiServer

def main():
    webcam_stream = None
    latest_image = None
    
    server = ApiServer(
        webcam_stream=webcam_stream,
        latest_image=latest_image
    )
    
    server.run()

if __name__ == "__main__":
    main()