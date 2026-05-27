from openai import OpenAI

client = OpenAI(
    api_key="fe_oa_b35d28c5e921fb2d3af951e1ef83dc13bf203f34b93141a0",
    base_url="https://api.freemodel.dev/v1"
)

response = client.chat.completions.create(
    model="gpt-5-4",
    messages=[
        {
            "role": "user",
            "content": "what is the current model of chat gpt"
        }
    ]
)

print(response.choices[0].message.content)