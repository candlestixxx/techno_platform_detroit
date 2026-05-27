import urllib.request
import json
import yaml

def get_free_models():
    """
    Queries the OpenRouter API for a list of available models,
    filters for free models, and sorts them by context length.
    """
    url = "https://openrouter.ai/api/v1/models"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error querying OpenRouter API: {e}")
        return []

    models = data.get("data", [])
    free_models = []

    for model in models:
        pricing = model.get("pricing", {})
        # Check if both prompt and completion are effectively free
        if pricing.get("prompt") == "0" and pricing.get("completion") == "0":
            free_models.append({
                "id": model.get("id"),
                "name": model.get("name"),
                "context_length": model.get("context_length", 0)
            })

    # Sort models by context length (descending) as a proxy for capability
    free_models.sort(key=lambda x: x["context_length"], reverse=True)

    # Return top 5 formatted for litellm
    top_models = free_models[:5]
    litellm_models = []

    for model in top_models:
        litellm_models.append({
            "model_name": model["id"],
            "litellm_params": {
                "model": f"openrouter/{model['id']}"
            }
        })

    return litellm_models

def configure_litellm():
    print("Querying and testing free model providers (OpenRouter)...")
    top_models = get_free_models()

    if not top_models:
        print("No free models found or API request failed.")
        return

    config = {
        "model_list": top_models
    }

    config_path = "litellm_config.yaml"
    with open(config_path, "w") as f:
        yaml.dump(config, f, sort_keys=False)

    print(f"Successfully configured LiteLLM to use the top {len(top_models)} free models. Saved to {config_path}")

if __name__ == "__main__":
    configure_litellm()
