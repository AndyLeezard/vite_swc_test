/**
 * cf example code from  https://github.com/solarkraft/lib-jitsi-meet-demo/blob/master/src/main.ts
 *
 * and so bad documentation from https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm-api
 */
import { JitsiConferenceEvents } from "@solyd/lib-jitsi-meet/dist/esm/JitsiConferenceEvents"
import { JitsiConnectionEvents } from "@solyd/lib-jitsi-meet/dist/esm/JitsiConnectionEvents"
import JitsiParticipant from "@solyd/lib-jitsi-meet/dist/esm/JitsiParticipant"
import JitsiTrack from "@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiTrack"
import { JitsiMeet } from "./JitsiMeet"
//import JitsiLocalTrack from "@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack"

class RTCManager {
  private static instance: JitsiMeet | null = null
  public static roomName: string = ""
  public static muted: boolean = false
  public static volume: number = 0.5

  /**
   * Singleton pattern
   */
  public static getInstance() {
    if (RTCManager.instance == null) {
      RTCManager.instance = new JitsiMeet(
        JitsiMeet.CONFIG_JAAS(RTCManager.roomName)
      )
    }
    return RTCManager.instance
  }

  static async connect(jwtoken: any, roomName: string) {
    var connectionEventListeners = new Map([
      [
        JitsiConnectionEvents.CONNECTION_DISCONNECTED,
        () => console.log("Disconnected from the server"),
      ],
      [
        JitsiConnectionEvents.CONNECTION_ESTABLISHED,
        () => console.log("Connection established"),
      ],
      [
        JitsiConnectionEvents.CONNECTION_FAILED,
        () => console.log("Connection failed"),
      ],
    ])

    // reinit instance if room name changed
    // config is dependant on roomName: one connection per room (cf xmpp websocket channel).
    if (roomName !== RTCManager.roomName && RTCManager.instance !== null) {
      RTCManager.instance.disconnect()
      RTCManager.instance = null
    }
    RTCManager.roomName = roomName
    // connect to JITSI server
    return await RTCManager.getInstance().connect(
      jwtoken,
      connectionEventListeners
    )
  }

  static async join(roomName: string) {
    // After this point the connection to the server is established, but the conference hasn't been joined yet.
    console.log("Connected to the server!")
    let self = this

    var conferenceEventListeners = new Map<JitsiConferenceEvents, Function>([
      [
        JitsiConferenceEvents.CONFERENCE_JOIN_IN_PROGRESS,
        () => console.log("Joining conference ..."),
      ],
      [
        JitsiConferenceEvents.USER_JOINED,
        (usr: string, user: JitsiParticipant) =>
          console.log(
            `User ${usr} joined (display name: ${user.getDisplayName()})`
          ),
      ],
      [
        JitsiConferenceEvents.USER_LEFT,
        (usr: string) => console.log(`User ${usr} left`),
      ],
      [
        JitsiConferenceEvents.MESSAGE_RECEIVED,
        (usr: string, msg: string) =>
          console.log(`Received message from user ${usr}: ${msg}`),
      ],
      [JitsiConferenceEvents.KICKED, () => console.log("Kicked :(")],
      [
        JitsiConferenceEvents.TRACK_ADDED,
        (track: JitsiTrack) => {
          //if (track.isLocalAudioTrack()) (track as JitsiLocalTrack).mute()
          self.onTrackAdded({
            track: track,
          })
        },
      ], // Show a new track that has been added (e.g. on user join)
      [
        JitsiConferenceEvents.TRACK_REMOVED,
        (track: JitsiTrack) =>
          console.log("A Track should be removed from display : ", track),
      ], // Remove a user's UI elements when they leave
      [
        JitsiConferenceEvents.CONFERENCE_JOINED,
        async () => {
          console.log("... conference joined")
          // Create local media tracks
          await RTCManager.getInstance().createLocalTracks()
        },
      ],
    ])

    return await RTCManager.getInstance().joinConference(
      roomName,
      conferenceEventListeners
    )
    //this.updateCallback()
  }

  /**
   * This callback should be defined in MQGCommunicator to make the link with JITSI objects from this class.
   * Or React ref from MQGCommunicator (audioRef and videoRef) should be passed in parameter to this object at construction.
   * @param track added track spec
   */
  static onTrackAdded(params: { track: any }) {
    const { track } = params
    console.log("CONF : track added to conference: ", track)
    const isLocal = track.isLocal()
    const participantId = track.getParticipantId()
    const trackId = track.getTrackId()
    const trackType = track.getType()
    console.log(
      `Track spec : local: ${isLocal} participant: ${participantId} id: ${trackId} type: ${trackType}`
    )
    //this.updateCallback()
  }

  static onConferenceJoined(args: any) {
    console.log("CONF : conference joined : ", args)
    //this.updateCallback()
  }

  static onUserJoined(user: any) {
    console.log("CONF : user joined the room : ", user)
    //this.updateCallback()
  }

  static onUserLeft(user: any) {
    console.log("CONF : user left the room : ", user)
    //this.updateCallback()
  }
}

export default RTCManager
