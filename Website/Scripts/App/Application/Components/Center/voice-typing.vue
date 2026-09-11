<template>
  <div>
    <span class="input-group">
      <input class="form-control input-sm" type="text" :value="value" @input="$emit('input', $event.target.value)" />
      <span class="input-group-btn">
        <button class="btn btn-sm" @click="startRecognition" style="border: solid 1px #E4E6EF; background-color: #ffffff;">
          <i class='fas fa-microphone'></i>
        </button>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      recognition: null,
    }
  },
  methods: {
    startRecognition() {
      if (!('webkitSpeechRecognition' in window)) {
        alert('Sorry, your browser does not support speech recognition.')
        return
      }

      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'th-TH'; // Set language to Thai
      this.recognition.interimResults = false
      this.recognition.maxAlternatives = 1

      this.recognition.onresult = (event) => {
        const newTranscript = event.results[0][0].transcript
        const updatedTranscript = this.value + ' ' + newTranscript
        this.$emit('input', updatedTranscript.trim())
      }

      this.recognition.onerror = (event) => {
        console.error(event.error)
      }

      this.recognition.onend = () => {
        console.log('Speech recognition service disconnected')
      }

      this.recognition.start()
    },
  },
}
</script>

<style scoped>
</style>
