FROM python:3.9

# Set the working directory
WORKDIR /

# Copy requirements and app files
COPY requirements.txt ./
COPY app.py ./

RUN pip install --upgrade pip && \
    pip install ultralytics \
    pip install torch \
    pip install python-dotenv \
    pip install flask \
    pip install flask-cors

# Expose Flask port
EXPOSE 5000

# Start the app
CMD ["python", "app.py"]
