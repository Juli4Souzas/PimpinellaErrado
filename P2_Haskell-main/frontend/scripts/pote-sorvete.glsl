precision highp float;
uniform vec2 tamanho;
uniform float angulo;

float ondas(vec3 p) {
  return sin(p.x) * sin(p.y) * sin(p.z);
}

float pote(vec3 p) {
  float raio = length(p.xz);
  float altura = clamp((p.y + .86) / 1.14, 0., 1.);
  float lateral = raio - mix(.68, .95, altura);
  float corpo = max(lateral, max(.15 - p.y - 1.0, p.y - .275));
  float cavidade = max(raio - mix(.60, .875, altura), -.68 - p.y);
  float borda = length(vec2(raio - .925, p.y - .278)) - .052;
  return min(max(corpo, -cavidade), borda);
}

float sorvete(vec3 p) {
  float esquerda = length((p - vec3(-.30, .31, .10)) / vec3(1., .96, 1.)) - .53;
  float direita = length((p - vec3(.28, .38, -.16)) / vec3(1., 1.06, 1.)) - .55;
  return min(esquerda, direita)
    + .025 * ondas(p * 12.) + .015 * ondas(p * 28.) + .005 * ondas(p * 69.);
}

float cena(vec3 p) {
  return min(pote(p), sorvete(p));
}

vec3 normal(vec3 p) {
  vec2 e = vec2(.002, 0.);
  return normalize(vec3(cena(p + e.xyy) - cena(p - e.xyy),
                        cena(p + e.yxy) - cena(p - e.yxy),
                        cena(p + e.yyx) - cena(p - e.yyx)));
}

vec3 embalagem(vec3 p) {
  vec3 creme = vec3(.99, .94, .83);
  vec3 azul = vec3(.30, .44, .67);
  float rotulo = smoothstep(-.71, -.70, p.y) * (1. - smoothstep(-.07, -.06, p.y));
  float margem = length(p.xz) > .80 || p.y < -.40 ? 1. : 0.;
  float volta = atan(p.z, p.x + .0001);
  float selo = length(vec2(volta * .85, (p.y + .38) * 1.2));
  vec3 corRotulo = mix(azul, creme, 1. - smoothstep(.21, .225, selo));
  float listra = max(1. - smoothstep(.009, .017, abs(p.y + .65)), 1. - smoothstep(.009, .017, abs(p.y + .12)));
  corRotulo = mix(corRotulo, creme, listra * .8);
  return mix(creme, corRotulo, rotulo * margem);
}

vec3 morango(vec3 p) {
  float textura = ondas(p * 10.) * .45 + ondas(p * 31.) * .22 + ondas(p * 85.) * .07;
  vec3 cor = mix(vec3(.76, .35, .37), vec3(1., .73, .69), .60 + textura);
  return mix(cor, vec3(.55, .17, .22), smoothstep(.65, .93, ondas(p * 48.)) * .30);
}

void main() {
  vec2 uv = (2. * gl_FragCoord.xy - tamanho) / tamanho.y;
  vec3 origem = vec3(0., .03, 5.3);
  vec3 raio = normalize(vec3(uv * .77, -2.85));
  float c = cos(angulo);
  float s = sin(angulo);
  mat3 giro = mat3(c, 0., s, 0., 1., 0., -s, 0., c);
  float tilt = .43 + .08 * sin(angulo);
  float ct = cos(tilt);
  float st = sin(tilt);
  mat3 elevacao = mat3(1., 0., 0., 0., ct, -st, 0., st, ct);
  mat3 vista = giro * elevacao;
  origem = vista * origem;
  raio = vista * raio;
  float distancia = 3.8;
  vec3 ponto;
  bool encontrou = false;

  for (int i = 0; i < 84; i++) {
    ponto = origem + raio * distancia;
    float passo = cena(ponto);
    if (passo < .003) { encontrou = true; break; }
    distancia += passo * .58;
    if (distancia > 6.6) break;
  }

  if (!encontrou) { gl_FragColor = vec4(0.); return; }
  vec3 n = normal(ponto);
  vec3 cor = pote(ponto) < sorvete(ponto) ? embalagem(ponto) : morango(ponto);
  vec3 luz = vista * normalize(vec3(-.57, .84, .71));
  vec3 rebatedor = vista * normalize(vec3(.85, -.12, .4));
  float difusa = max(0., dot(n, luz));
  float reflexo = pow(max(0., dot(n, normalize(luz - raio))), 20.) * .12;
  gl_FragColor = vec4(cor * (.62 + .35 * difusa + .14 * max(0., dot(n, rebatedor))) + reflexo, 1.);
}
