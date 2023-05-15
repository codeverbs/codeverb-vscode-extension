import speech_recognition as sr
import sys

def transcribe_audio(audio_file_path):
    r = sr.Recognizer()

    with sr.AudioFile(audio_file_path) as source:
        audio = r.record(source)

    return r.recognize_google(audio)
    
if __name__ == '__main__':
    audio_file_path = sys.argv[1]
    transcription = transcribe_audio(audio_file_path)
    print(transcription)