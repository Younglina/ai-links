<template>
  <button :class="classNames">
    <div class="sign">
      <slot></slot>
    </div>
    <div class="text">{{ text }}</div>
  </button>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
})

const classNames = computed(() => {
  return `Btn ${props.type}`
})
</script>
<style>
/* From Uiverse.io by vinodjangid07 */ 
.Btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: .3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
}
.Btn.primary {
  background-color: #1677ff;
  i, .text {
    color: white;
  }
}
/* plus sign */
.sign {
  width: 100%;
  transition-duration: .3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign i {
  min-width: 1.2em;
  min-height: 1.2em;
}

.text {
  position: absolute;
  right: 0%;
  width: 0%;
  opacity: 0;
  font-size: 1em;
  font-weight: 600;
  transition-duration: .3s;
  white-space: nowrap;
}
/* hover effect on button width */
.Btn:hover {
  width: 125px;
  border-radius: 40px;
  transition-duration: .3s;
}

.Btn:hover .sign {
  width: 30%;
  transition-duration: .3s;
  padding-left: 20px;
}
/* hover effect button's text */
.Btn:hover .text {
  opacity: 1;
  width: 70%;
  transition-duration: .3s;
  padding-right: 10px;
}
/* button click effect*/
.Btn:active {
  transform: translate(2px ,2px);
}
</style>