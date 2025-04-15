export const queueOperation = (operation) => {
    const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
    queuedOperations.push(operation);
    localStorage.setItem('queuedOperations', JSON.stringify(queuedOperations));
  };
  
  export const getQueuedOperations = () => {
    return JSON.parse(localStorage.getItem('queuedOperations')) || [];
  };
  
  export const clearQueuedOperations = () => {
    localStorage.removeItem('queuedOperations');
  };