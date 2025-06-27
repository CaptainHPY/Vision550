from openai import OpenAI
from vision550.config_loader import config

class Assistant:
    def __init__(self, api_key):
        model_config = config.get_model_config()
        self.model = model_config.get('mllm')
        self.client = OpenAI(base_url=model_config.get('mllm_base_url'), api_key=api_key)

    def answer(self, prompt, image):
        if not prompt:
            return

        print("Prompt:", prompt)
        image_decoded = image.decode()
        system_message = config.get_system_message()

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_message
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": 
                            {
                                "url": f"data:image/jpeg;base64,{image_decoded}"
                            },
                        },
                    ],
                }
            ],
        )

        response = response.choices[0].message.content.strip()
        print("Response:", response)

        return response
