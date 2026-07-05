# Use an official lightweight Python image
FROM python:3.11-slim

# Set environment variables for optimized Python runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Copy only the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Render will provide the PORT environment variable at runtime
ENV PORT=8001

# Expose the port (informative)
EXPOSE ${PORT}

# Run the application using uvicorn, binding to 0.0.0.0 and the configured PORT
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
