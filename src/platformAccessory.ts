import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";
import { RPIWS281xPlatform } from "./platform";
import axios from "axios";
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class RPIWS281xAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private state = {
    power: false,
    hue: 300,
    saturation: 100,
    brightness: 100,
  };

  private pixels = new Uint32Array(1024);

  constructor(
    private readonly platform: RPIWS281xPlatform,
    private readonly accessory: PlatformAccessory
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        "Default-Manufacturer"
      )
      .setCharacteristic(this.platform.Characteristic.Model, "Default-Model")
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        "Default-Serial"
      );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.displayName
    );

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    this.service
      .getCharacteristic(this.platform.Characteristic.Hue)
      .onSet(this.setHue.bind(this))
      .onGet(this.getHue.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.Saturation)
      .onSet(this.setSaturation.bind(this))
      .onGet(this.getSaturation.bind(this));

    // register handlers for the Brightness Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this)) // SET - bind to the 'setBrightness` method below
      .onGet(this.getBrightness.bind(this));

    setInterval(this.getState.bind(this), 500);
  }

  async setState(payload) {
    try {
      const fetch = await axios.post("http://127.0.0.1/state", payload);
      this.updateState(fetch.data);
    } catch (err) {
      console.error(err);
    }
  }
  async getState() {
    try {
      const fetch = await axios.get("http://127.0.0.1/state");
      this.updateState(fetch.data);
    } catch (err) {
      console.error(err);
    }
  }
  updateState(state: any) {
    this.state = {
      power: (state ? state.power : undefined) || this.state.power,
      hue: (state ? state.hue : undefined) || this.state.hue,
      saturation:
        (state ? state.saturation : undefined) || this.state.saturation,
      brightness:
        (state ? state.brightness : undefined) || this.state.brightness,
    };
  }

  async setOn(value: CharacteristicValue) {
    const power = value as boolean;
    this.setState({ power });
  }

  async setHue(value: CharacteristicValue) {
    const hue = value as number;
    this.setState({ hue });
  }
  async setSaturatione(value: CharacteristicValue) {
    const saturation = value as number;
    this.setState({ saturation });
  }

  async setBrightness(value: CharacteristicValue) {
    const brightness = value as number;
    this.setState({ brightness });
  }

  async getOn(): Promise<CharacteristicValue> {
    return this.state.power;
  }

  async getHue(): Promise<CharacteristicValue> {
    return this.state.hue;
  }
  async getSaturation(): Promise<CharacteristicValue> {
    return this.state.saturation;
  }

  async getBrightness(): Promise<CharacteristicValue> {
    return this.state.brightness;
  }
}
