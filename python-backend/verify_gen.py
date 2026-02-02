try:
    print("Importing document_generator...")
    import document_generator
    print("Import successful.")

    print("Initializing generator (lazy load)...")
    generator = document_generator.get_generator()
    print("Generator initialized.")

    text = "The system must allow users to log in securely. The project budget is 5000 USD."
    print(f"Testing generation with text: {text}")

    try:
        doc = document_generator.generate_document(text, 'brd', {'project_name': 'Test Project'})
        print("Document generated successfully!")
        print(f"Document length: {len(doc)}")
        print("Snippet:")
        print(doc[:200])
    except Exception as e:
        print(f"Generation failed: {e}")
        import traceback
        traceback.print_exc()

except ImportError as e:
    with open('verification_error.log', 'w') as f:
        f.write(f"Import failed: {e}")
    print(f"Import failed: {e}")
except Exception as e:
    with open('verification_error.log', 'w') as f:
        f.write(f"An error occurred: {e}")
    print(f"An error occurred: {e}")
