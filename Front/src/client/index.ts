// Front/src/client/index.ts
// import axios from 'axios' // Remover importação original do axios
import { ReqTypes } from './reqTypes'

// Importar a instância de api configurada
import api from '../services/api';

// Remover a criação da instância httpClient hardcoded com localhost:8000
// const httpClient = axios.create({
//   baseURL: 'http://localhost:8000',
//   // Atenção para enviar headers corretos para FormData, axios cuida disso automaticamente
//   // mas caso queira forçar, usar 'Content-Type': 'multipart/form-data' NÃO é recomendado pois
//   // o axios adiciona o boundary sozinho
// })

// Atualizar o objeto req para usar a instância api importada
const req = {
  post: (path: string, body: any, options?: any) =>
    api.post(path, body, options).then((response: any) => response.data) // Usar 'api.post' em vez de 'httpClient.post'
}

const client: ReqTypes = {
  sendImage: (reqData) => {
    // Função para converter dataURL para Blob
    const dataURLToBlob = (dataURL: string): Blob => {
      const [metadata, base64Data] = dataURL.split(',')
      const mimeMatch = metadata.match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : ''
      const byteString = atob(base64Data)
      const arrayBuffer = new Uint8Array(byteString.length)

      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i)
      }

      return new Blob([arrayBuffer], { type: mime })
    }

    const formData = new FormData()

    // Se reqData.file já for File, use direto, senão converta data_url para Blob/File
    let fileToSend: File | Blob
    if (
      typeof reqData.file === 'object' &&
      reqData.file !== null &&
      'data_url' in reqData.file
    ) {
      const blob = dataURLToBlob(reqData.file.data_url)
      fileToSend = new File([blob], reqData.file.name || 'upload.png', { type: blob.type })
    } else {
      fileToSend = reqData.file
    }

    formData.append('image', fileToSend)
    formData.append('exam_type', reqData.exam_type)

    if (reqData.patient_sex) {
      formData.append('patient_sex', reqData.patient_sex)
    }

    if (reqData.selected_diseases_json) {
      formData.append('selected_diseases_json', JSON.stringify(reqData.selected_diseases_json))
    }

    // Importante: não defina o 'Content-Type' explicitamente, o axios seta multipart/form-data com boundary automaticamente
    return req.post(reqData.path, formData, {
      headers: {
        // Pode adicionar outros headers se necessário, por exemplo auth token
      },
    })
  },
}

export { client }
