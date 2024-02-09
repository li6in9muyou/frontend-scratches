Draggable.pipeMultipleCallbacks = function (cb) {
  if (Array.isArray(cb)) {
    return (oldPos, newPos) => cb.reduce(
      (updatedNewPos, fn) => fn(oldPos, updatedNewPos) ?? updatedNewPos, newPos,
    );
  } else {
    return cb;
  }
};

function Draggable(elem, cbDragStart, cbDragEnd, cbDragMove) {
  this.elem = elem;
  this.elem.style.position = "relative";
  this.elem.parentElement.style.position = "relative";
  this.cbDragStart = Draggable.pipeMultipleCallbacks(cbDragStart);
  this.cbDragEnd = Draggable.pipeMultipleCallbacks(cbDragEnd);
  this.cbDragMove = Draggable.pipeMultipleCallbacks(cbDragMove);
  this.dragging = false;
  this.lastMousePos = { x: 0, y: 0 };
  this.dragKey = NaN;
  elem.addEventListener("mousedown", this.onDragStart.bind(this));
  document.addEventListener("mousedown", this.onDragMove.bind(this));
  document.addEventListener("mouseup", this.onDragEnd.bind(this));
}

Draggable.prototype.onDragStart = function (e) {
  if (!isNaN(this.dragKey) && e.button !== this.dragKey) {
    return;
  }
  if (this.dragging) {
    return;
  }

  this.dragKey = e.button;
  this.dragging = true;
  this.elem.dataset.dgDragging = this.dragging;
  this.lastMousePos.x = e.clientX;
  this.lastMousePos.y = e.clientY;
  this.cbDragStart && this.cbDragStart(e);
};

Draggable.prototype.onDragMove = function (e) {
  if (!this.dragging) {
    return;
  }

  const posDiff = {
    x: e.clientX - this.lastMousePos.x,
    y: e.clientY - this.lastMousePos.y,
  };
  this.lastMousePos.x = e.clientX;
  this.lastMousePos.y = e.clientY;
  const oldPos = {
    x: this.elem.offsetLeft,
    y: this.elem.offsetTop,
  };
  let newPos = { ...oldPos };
  newPos.x += posDiff.x;
  newPos.y += posDiff.y;

  if (this.cbDragMove) {
    newPos = this.cbDragMove(oldPos, newPos, e) ?? newPos;
  }

  this.elem.style.top = newPos.y + "px";
  this.elem.style.left = newPos.x + "px";
};

Draggable.prototype.onDragEnd = function (e) {
  if (!isNaN(this.dragKey) && e.button !== this.dragKey) {
    return;
  }
  if (!this.dragging) {
    return;
  }
  this.dragKey = NaN;
  this.dragging = false;
  this.elem.dataset.dgDragging = this.dragging;
  this.cbDragEnd && this.cbDragEnd(e);
};