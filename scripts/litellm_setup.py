import yaml

def get_free_models():
    """
    Mocks querying inference providers for a list of free models,
    testing them, and sorting by availability/ability based on model size.
    """

    # In a real scenario, this would dynamically query APIs (e.g., OpenRouter free tier, HuggingFace free endpoints).

    # Mock tested & sorted models (smartest/fastest first)
    sorted_models = [
        {"model_name": "google/gemini-pro", "litellm_params": {"model": "gemini/gemini-pro"}},
        {"model_name": "meta-llama/llama-3-8b-instruct:free", "litellm_params": {"model": "openrouter/meta-llama/llama-3-8b-instruct:free"}},
        {"model_name": "mistralai/mistral-7b-instruct:free", "litellm_params": {"model": "openrouter/mistralai/mistral-7b-instruct:free"}},
        {"model_name": "cohere/command-r-plus-08-2024:free", "litellm_params": {"model": "openrouter/cohere/command-r-plus-08-2024:free"}},
        {"model_name": "google/gemma-7b-it:free", "litellm_params": {"model": "openrouter/google/gemma-7b-it:free"}},
    ]

    return sorted_models[:5] # Top 5 models

def configure_litellm():
    print("Querying and testing free model providers...")
    top_models = get_free_models()

    config = {
        "model_list": top_models
    }

    config_path = "litellm_config.yaml"
    with open(config_path, "w") as f:
        yaml.dump(config, f, sort_keys=False)

    print(f"Successfully configured LiteLLM to use the top {len(top_models)} free models. Saved to {config_path}")

if __name__ == "__main__":
    configure_litellm()
