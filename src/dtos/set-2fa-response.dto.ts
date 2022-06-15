export class Set2faResponseDto {
  public qrcode: string;
  public key: string;

  constructor(qrcode: string, key: string) {
    this.qrcode = qrcode;
    this.key = key;
  }
}
