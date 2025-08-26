class PeerService{
    constructor(){
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls:[
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478"
                    ]
                }]
            })
        }
    }

    async getAnswer(offer){
        if(this.peer){
            //await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer();
            // await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            // await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            await this.peer.setLocalDescription(ans);
            return ans;
        }
    }

    async setLocalDescription(ans){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            // await this.peer.setLocalDescription(ans);
        }
    }

    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            //await this.peer.setLocalDescription(offer);
            return offer;
        }
    }

    async addIceCandidate(candidate) {
        if (this.peer) {
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ICE candidate:", err);
            }
        }
    }
}

export default new PeerService();

