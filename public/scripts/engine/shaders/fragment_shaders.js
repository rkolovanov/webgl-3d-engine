export default
`#version 300 es

precision mediump float;

struct Light
{
    vec3 diffuse;
    vec3 ambient;
    vec3 specular;
    vec4 position;
};

struct Material 
{ 
    vec3 diffuse;
    vec3 ambient;
    vec3 specular;
    float shininess;
};

const int LIGHT_NUMBER = 2;

in vec3 v_vertexPosition;
in vec3 v_vertexNormal;
in vec2 v_texturePosition;

uniform vec3 u_cameraPosition;
uniform bool u_useLighting;
uniform Light u_lights[LIGHT_NUMBER];
uniform Material u_material;
uniform bool u_useTexture;
uniform sampler2D u_texture;
uniform float u_textureScale;

out vec4 finalColor;

vec3 globalNormal;

vec4 calculateLight();

void main() {
    vec4 resultColor = vec4(u_material.diffuse, 1.0);
    globalNormal = normalize(v_vertexNormal);
    
    if (u_useTexture) {
        resultColor = texture(u_texture, u_textureScale * v_texturePosition);
    }
    
    if (u_useLighting) {
        resultColor = calculateLight();
    }
    
    finalColor = resultColor;
}

vec4 calculateLight() {
    float alpha = 1.0;
    vec4 resultColor = vec4(0, 0, 0, 0);
    
    for(int i = 0; i < LIGHT_NUMBER; ++i) {
        Light light = u_lights[i];
        
        vec3 lightDirection;
        if (light.position.w == 0.0) {
            lightDirection = normalize(light.position.xyz);
        } else {
            lightDirection = normalize(light.position.xyz - v_vertexPosition.xyz);
        }

        float Kd = max(dot(lightDirection, globalNormal), 0.0);
      
        vec3 eyeDirection = normalize(u_cameraPosition - v_vertexPosition.xyz);
        vec3 halfVector = normalize(eyeDirection + lightDirection);
        float Ks = pow(max(dot(halfVector, globalNormal), 0.0), u_material.shininess);
        
        vec3 materialDiffuse = u_material.diffuse;
        if (u_useTexture) {
            vec4 t = texture(u_texture, u_textureScale * v_texturePosition);
            materialDiffuse.rgb = t.rgb;
            alpha = t.a;
        }
    
        resultColor.xyz += Ks * materialDiffuse * light.specular
                         + Kd * materialDiffuse * light.diffuse
                         + u_material.ambient * light.ambient;
    }
    
    resultColor.a = alpha;
    
    return resultColor;
}
`;
