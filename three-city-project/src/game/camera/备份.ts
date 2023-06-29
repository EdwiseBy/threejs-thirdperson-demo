// if (!this.owner) return;
// if (!this.originPoint) this.originPoint = this.position.clone();
// const { lastFramePosition, curFramePostion } = this.owner;
// if (!this.ownerOriginPoint) this.ownerOriginPoint = lastFramePosition.clone();
// if (curFramePostion && this.ownerOriginPoint && !curFramePostion.equals(this.ownerOriginPoint)) {
//     const playerOriginP = new THREE.Vector3(this.ownerOriginPoint.x, 0, this.ownerOriginPoint.z);
//     const playerTargetP = new THREE.Vector3(curFramePostion.x, 0, curFramePostion.z);
//     const cameraOriginP = new THREE.Vector3(this.originPoint.x, 0, this.originPoint.z);
//     let cameraTargetP = new THREE.Vector3();
//     /** 玩家两点连线的斜率 */
//     const kp = (playerOriginP.z - playerTargetP.z) / (playerOriginP.x - playerTargetP.x);
//     /** 玩家起始点与相机起始点连线的斜率 */
//     const kopc = (cameraOriginP.z - playerOriginP.z) / (cameraOriginP.x - playerOriginP.x);
//     // 如果运动在一条直线，直接加
//     if ((kp === kopc) || (isInfinity(kp) && isInfinity(kopc))) {
//         // cameraTargetP.set(cameraOriginP.x, 0, cameraOriginP.z).add(new THREE.Vector3(this.speed.x * this.speedVector.x, 0, this.speed.z * this.speedVector.z));
//         cameraTargetP.set(cameraOriginP.x, 0, cameraOriginP.z).add(curFramePostion.sub(this.ownerOriginPoint));
//     } else {
//         let cameraCenterP = new THREE.Vector3();
//         /** 直线1是玩家目标点与摄像机起始点的直线方程 */
//         let k1 = (playerTargetP.z - cameraOriginP.z) / (playerTargetP.x - cameraOriginP.x);
//         /** 直线2是直线1的垂直平分线 */
//         let centerP = new THREE.Vector3((playerTargetP.x + cameraOriginP.x) / 2, 0, (playerTargetP.z + cameraOriginP.z) / 2);
//         let k2 = isInfinity(k1) ? 0 : k1 === 0 ? Infinity : 1 / k1 * -1;
//         let b2: number | null = centerP.z - k2 * centerP.x;
//         if (isInfinity(k2)) b2 = null;
//         /** 直线3是平行于直线1的玩家起始点与相机目标点的连线 */
//         let k3 = k1;
//         let b3: number | null = playerOriginP.z - k3 * playerOriginP.x;
//         if (isInfinity(k3)) b3 = null;
//         if (b2 == null && b3 != null) {
//             cameraCenterP.set(centerP.x, 0, playerOriginP.z);
//         }
//         else if (b3 == null && b2 != null) {
//             cameraCenterP.set(playerOriginP.x, 0, centerP.z);
//         }
//         else if (b3 != null && b2 != null) {
//             // 求直线3与直线2的交点，其实就是中点，再根据中点算出摄像机目标点
//             let crossP = new THREE.Vector3();
//             crossP.x = (b3 - b2) / (k2 - k3);
//             crossP.z = k3 * crossP.x + b3;
//             cameraCenterP.set(crossP.x, 0, crossP.z);
//         }
//         cameraTargetP.set(2 * cameraCenterP.x - playerOriginP.x, 0, (2 * cameraCenterP.z - playerOriginP.z));
//     }
//     this.targetPoint = cameraTargetP.clone().setY(this.owner.position.y + 4);
//     // const v = new Three.Vector3(cameraTargetP.x, this.owner.position.y + 4, cameraTargetP.z).sub(this.position.clone());
//     // this.translateOnAxis(v.normalize(), v.length());
//     // if (this.tween) {
//     //     const self = this;
//     //     this.tweenObj.x = this.position.x;
//     //     this.tweenObj.y = this.position.y;
//     //     this.tweenObj.z = this.position.z;
//     //     // this.tween.stop();
//     //     // this.quaternion.rotateTowards()
//     //     if (!this.tween.isPlaying())
//     //         this.tween.to({ x: cameraTargetP.x, y: this.owner.position.y + 4, z: cameraTargetP.z }, 20).onUpdate(function (e) {
//     //             // console.info(e);
//     //             // self.position.set(e.x, e.y, e.z);
//     //         }).start();
//     //     // this.position.set(cameraTargetP.x, this.owner.position.y + 4, cameraTargetP.z);
// }
// if (this.targetPoint && Math.abs(this.targetPoint.distanceTo(this.position)) > 0.0001) {
//     this.quaternion.identity()
//     // const speed = 0.01;
//     // const vector = this.targetPoint.sub(this.position.clone()).normalize();
//     // const dis = this.targetPoint.distanceTo(this.position.clone());
//     const disX = Math.abs(this.targetPoint.x - this.position.x);
//     const disY = Math.abs(this.targetPoint.y - this.position.y);
//     const disZ = Math.abs(this.targetPoint.z - this.position.z);
//     const vectorX = this.targetPoint.x > this.position.x ? 1 : -1;
//     const vectorY = this.targetPoint.y > this.position.y ? 1 : -1;
//     const vectorZ = this.targetPoint.z > this.position.z ? 1 : -1;
//     // this.position.set(this.position.x + disX/5 * vectorX, this.position.y + disY/5 * vectorY, this.position.z + disZ?/5* vectorZ)
//     // this.position.addScaledVector(vector, dis)
//     console.info('wwww', delta)
//     this.position.lerp(this.targetPoint, delta * 2)
//     // // dis / 3;
//     // // this.position.addScaledVector(this.targetPoint.sub(this.position.clone()).normalize(), this.targetPoint.lerp);
//     // this.lerpValue += 0.2;
//     // if (this.lerpValue > 1) this.lerpValue = 0.2;
//     // this.position.lerp(this.targetPoint, this.lerpValue);
//     // this.position.set(cameraTargetP.x, this.owner.position.y + 4, cameraTargetP.z);
//     // }
//     // this.position.copy(this.targetPoint.clone());
// } else {
//     this.originPoint = this.position.clone();
//     this.ownerOriginPoint = lastFramePosition.clone();
// }
// this.lookAt(new Three.Vector3(this.owner.position.x, this.owner.position.y + 3, this.owner.position.z))

//     }
export {};