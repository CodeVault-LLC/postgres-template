import { promises as fs } from "fs";
import pkg from "node-forge";
const { pki } = pkg;

type SSLInfo = {
  country: string;
  state: string;
  city: string;
  organization: string;
  organizationUnit: string;
  commonName: string;
  emailAddress: string;
};

type GeneratedSSLPaths = {
  keyPath: string;
  certPath: string;
  caPath: string;
};

export const generateSSL = async (
  ssl: SSLInfo,
  outputDir: string
): Promise<GeneratedSSLPaths> => {
  // Generate a key pair
  const keys = pki.rsa.generateKeyPair(2048);

  // Create a certificate
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  // Subject and issuer details
  const attrs = [
    { name: "commonName", value: ssl.commonName },
    { name: "countryName", value: ssl.country },
    { shortName: "ST", value: ssl.state },
    { name: "localityName", value: ssl.city },
    { name: "organizationName", value: ssl.organization },
    { shortName: "OU", value: ssl.organizationUnit },
    { name: "emailAddress", value: ssl.emailAddress },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Add extensions
  cert.setExtensions([
    { name: "basicConstraints", cA: true },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: "nsCertType",
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        { type: 6, value: "http://example.org/webid#me" }, // URI
        { type: 7, ip: "127.0.0.1" }, // IP
      ],
    },
  ]);

  // Self-sign the certificate
  cert.sign(keys.privateKey);

  // Define output file paths
  const keyPath = `${outputDir}/ssl_key.pem`;
  const certPath = `${outputDir}/ssl_cert.pem`;
  const caPath = `${outputDir}/ssl_ca_cert.pem`;

  // Save the private key, certificate, and CA certificate
  await fs.writeFile(keyPath, pki.privateKeyToPem(keys.privateKey), "utf-8");
  await fs.writeFile(certPath, pki.certificateToPem(cert), "utf-8");
  await fs.writeFile(caPath, pki.certificateToPem(cert), "utf-8"); // For simplicity, using self-signed cert as CA

  return { keyPath, certPath, caPath };
};
