/**
 * MemoryQueue Service
 * Sistema básico de colas en memoria para evitar saturar recursos locales como Ollama.
 * Garantiza que las llamadas a la IA corran con una concurrencia controlada (ej. 1 a la vez).
 */
class MemoryQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }

  // Agrega un nuevo trabajo (función asíncrona) a la cola
  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  // Procesa el siguiente trabajo si hay capacidad
  processNext() {
    if (this.queue.length === 0 || this.running >= this.concurrency) {
      return;
    }

    const nextTask = this.queue.shift();
    this.running++;

    console.log(`[Cola IA] Iniciando tarea. Restantes en fila: ${this.queue.length}. Corriendo: ${this.running}`);

    nextTask().finally(() => {
      this.running--;
      console.log(`[Cola IA] Tarea finalizada. Corriendo: ${this.running}`);
      // Llama recursivamente para destrabar el siguiente en la fila
      this.processNext();
    });
  }

  // Permite saber cuántos trabajos están pendientes
  getPendingCount() {
    return this.queue.length;
  }
}

// Exportamos un singleton configurado para Ollama (1 hilo a la vez para no colapsar la VRAM/RAM)
const aiQueue = new MemoryQueue(1);

module.exports = {
  aiQueue,
  MemoryQueue
};
