export default
`
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

uniform vec3 u_cameraPosition;
uniform bool u_lighting;
uniform Light u_lights[LIGHT_NUMBER];
uniform Material u_material;
uniform vec4 u_vertexColor;

varying vec3 v_vertexPosition;
varying vec3 v_vertexNormal;

vec4 calculateLight();

void main() {
    vec4 resultColor = u_vertexColor;
    if (u_lighting) {
        resultColor.xyz *= calculateLight().xyz;
    }
    gl_FragColor = resultColor;
}

vec4 calculateLight() {
    vec4 resultColor = vec4(0, 0, 0, 0);
    
    for(int i = 0; i < LIGHT_NUMBER; ++i) {
        Light light = u_lights[i];
        
        vec3 lightDirection;
        if (light.position.w == 0.0) {
            lightDirection = normalize(light.position.xyz);
        } else {
            lightDirection = normalize(light.position.xyz - v_vertexPosition.xyz);
        }

        float Kd = max(dot(lightDirection, v_vertexNormal), 0.0);
      
        vec3 eyeDirection = normalize(u_cameraPosition - v_vertexPosition.xyz);
        vec3 halfVector = normalize(eyeDirection + lightDirection);
        float Ks = pow(max(dot(halfVector, v_vertexNormal), 0.0), u_material.shininess);
    
        resultColor.xyz += Ks * u_material.specular * light.specular
                         + Kd * u_material.diffuse * light.diffuse
                         + u_material.ambient * light.ambient;
    }
    
    resultColor.a = 1.0;
    
    return resultColor;
}
`;
