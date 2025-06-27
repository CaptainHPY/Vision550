import os
import yaml

class ConfigLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigLoader, cls).__new__(cls)
            cls._instance._load_config()
        return cls._instance
    
    def _load_config(self):
        root_dir = os.path.dirname(os.path.dirname(__file__))
        config_path = os.path.join(root_dir, 'config', 'config.yaml')
        with open(config_path, 'r', encoding='utf-8') as file:
            self.config = yaml.safe_load(file)
    
    def get_app_config(self):
        return self.config.get('app', {})
    
    def get_model_config(self):
        return self.config.get('model', {})
    
    def get_system_message(self):
        return self.config.get('system_message', '')
    
    def get_config_value(self, section, key, default=None):
        section_data = self.config.get(section, {})
        return section_data.get(key, default)

config = ConfigLoader()
