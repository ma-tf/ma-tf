export const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const TRIAD_SHADER = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D samples;
uniform vec2 size;
uniform float cell;
uniform float pitch;
uniform ivec2 grid;
uniform ivec2 sampleSize;
uniform mat3 forwardTilt;
uniform mat3 inverseTilt;
out vec4 colour;

const float PIXEL = 0.5641895835477563;
const float PI = 3.141592653589793;

float coverage(float radius, float distance) {
  if (radius <= 0.0 || distance >= radius + PIXEL) return 0.0;
  if (distance <= abs(radius - PIXEL)) {
    float inner = min(radius, PIXEL);
    return PI * inner * inner;
  }
  float d2 = distance * distance;
  float r2 = radius * radius;
  float p2 = PIXEL * PIXEL;
  float nearAngle = acos(clamp((d2 + r2 - p2) / (2.0 * distance * radius), -1.0, 1.0));
  float farAngle = acos(clamp((d2 + p2 - r2) / (2.0 * distance * PIXEL), -1.0, 1.0));
  float kite = (-distance + radius + PIXEL) * (distance + radius - PIXEL) * (distance - radius + PIXEL) * (distance + radius + PIXEL);
  return r2 * nearAngle + p2 * farAngle - 0.5 * sqrt(max(0.0, kite));
}

float tone(float value, float luma) {
  float saturated = clamp(luma + (value - luma) * 1.02, 0.0, 255.0);
  float unit = saturated / 255.0;
  float toned = min(255.0, saturated * 1.05 + unit * unit * unit * unit * 70.0);
  float gain = toned < 128.0 ? 1.35 : 1.2;
  return clamp(128.0 + (toned - 128.0) * gain, 0.0, 255.0);
}

vec3 place(mat3 h, vec2 point) {
  vec3 mapped = h * vec3(point - size * 0.5, 1.0);
  return vec3(mapped.xy / mapped.z + size * 0.5, 1.0 / mapped.z);
}

float channel(vec2 point, int index) {
  ivec2 at = clamp(ivec2(floor(point / pitch + 0.5)), ivec2(0), sampleSize - 1);
  return floor(texelFetch(samples, at, 0)[index] * 255.0 + 0.5);
}

float disc(vec2 pixel, vec2 centre, float radius) {
  vec3 placed = place(forwardTilt, centre);
  return coverage(radius * placed.z, distance(pixel, placed.xy));
}

float stagger(int row) {
  return (row & 1) == 0 ? cell * 0.5 : 0.0;
}

vec3 triad(int row, int column, vec2 pixel) {
  vec2 centre = vec2(cell * 0.82 + float(column) * cell + cell * 0.5 + stagger(row), cell * 0.57 + float(row) * cell + cell * 0.5);
  float spread = cell * 0.29;
  vec2 redAt = centre + vec2(-spread, -spread);
  vec2 greenAt = centre + vec2(spread, -spread);
  vec2 blueAt = centre + vec2(0.0, spread);
  float red = channel(redAt, 0);
  float green = channel(greenAt, 1);
  float blue = channel(blueAt, 2);
  float luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  vec3 toned = floor(vec3(tone(red, luma), tone(green, luma), tone(blue, luma)) + 0.5);
  float whole = 0.5 * disc(pixel, centre, cell * 0.5);
  float primary = cell * 0.28;
  return toned * vec3(
    whole + disc(pixel, redAt, primary),
    whole + disc(pixel, greenAt, primary),
    whole + disc(pixel, blueAt, primary)
  );
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 point = place(inverseTilt, pixel).xy;
  float reach = cell * 0.72 + 0.6;
  float originY = cell * 0.57 + cell * 0.5;
  int rowStart = max(0, int(ceil((point.y - reach - originY) / cell)));
  int rowEnd = min(grid.y - 1, int(floor((point.y + reach - originY) / cell)));
  vec3 sum = vec3(0.0);
  for (int row = rowStart; row <= rowEnd; row++) {
    float originX = cell * 0.82 + cell * 0.5 + stagger(row);
    int columnStart = max(0, int(ceil((point.x - reach - originX) / cell)));
    int columnEnd = min(grid.x - 1, int(floor((point.x + reach - originX) / cell)));
    for (int column = columnStart; column <= columnEnd; column++) {
      sum += triad(row, column, pixel);
    }
  }
  colour = vec4(min(sum, vec3(255.0)) / 255.0, 1.0);
}
`;

export const BLUR_SHADER = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D image;
uniform ivec2 direction;
uniform int taps;
uniform float sigma;
uniform float contrast;
out vec4 colour;

vec4 tap(ivec2 at, ivec2 limit) {
  if (any(lessThan(at, ivec2(0))) || any(greaterThanEqual(at, limit))) return vec4(0.0);
  vec4 value = texelFetch(image, at, 0);
  if (contrast <= 0.0) return value;
  return vec4(clamp((value.rgb - 0.5) * contrast + 0.5, 0.0, 1.0), 1.0);
}

void main() {
  ivec2 origin = ivec2(gl_FragCoord.xy);
  ivec2 limit = textureSize(image, 0);
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int offset = -taps; offset <= taps; offset++) {
    float weight = exp(-float(offset * offset) / (2.0 * sigma * sigma));
    sum += weight * tap(origin + direction * offset, limit);
    total += weight;
  }
  colour = sum / total;
}
`;

export const COMPOSITE_SHADER = `#version 300 es
precision highp float;
uniform sampler2D base;
uniform sampler2D glow;
uniform float strength;
out vec4 colour;

void main() {
  ivec2 at = ivec2(gl_FragCoord.xy);
  vec3 lit = texelFetch(base, at, 0).rgb;
  vec3 light = texelFetch(glow, at, 0).rgb;
  colour = vec4(lit + strength * light * (1.0 - lit), 1.0);
}
`;
