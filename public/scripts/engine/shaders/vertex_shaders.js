export default
`
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

attribute vec3 a_vertexPosition;
attribute vec3 a_vertexNormal;

uniform vec3 u_cameraPosition;
uniform vec4 u_vertexColor;
uniform mat4 u_mMatrix;
uniform mat4 u_vMatrix;
uniform mat4 u_pMatrix;
uniform mat4 u_nMatrix;
uniform bool u_lighting;
uniform Light u_lights[LIGHT_NUMBER];
uniform Material u_material;

varying vec4 v_vertexColor;

vec4 globalPosition;
vec3 globalNormal;

vec4 calculateLight();

void main() {
    globalPosition = u_mMatrix * vec4(a_vertexPosition, 1.0);
    
    v_vertexColor = u_vertexColor;
    if (u_lighting) {
        globalNormal = normalize((u_nMatrix * vec4(a_vertexNormal, 0.0)).xyz);
        v_vertexColor.xyz *= calculateLight().xyz;
    }
    
    gl_Position = u_pMatrix * u_vMatrix * globalPosition;
}

vec4 calculateLight() {
    vec4 resultColor = vec4(0, 0, 0, 0);
    
    for(int i = 0; i < LIGHT_NUMBER; ++i) {
        Light light = u_lights[i];
        
        vec3 lightDirection;
        if (light.position.w == 0.0) {
            lightDirection = normalize(light.position.xyz);
        } else {
            lightDirection = normalize(light.position.xyz - globalPosition.xyz);
        }

        float Kd = max(dot(lightDirection, globalNormal), 0.0);
        float Ks = 0.0;
        if (Kd > 0.0) {
            vec3 eyeDirection = normalize(u_cameraPosition - globalPosition.xyz);
            vec3 halfVector = normalize(eyeDirection + lightDirection);
            Ks = pow(max(dot(halfVector, globalNormal), 0.0), u_material.shininess);
        }
        
        resultColor.xyz += Ks * u_material.specular * light.specular
                         + Kd * u_material.diffuse * light.diffuse
                         + u_material.ambient * light.ambient;
    }
    
    resultColor.a = 1.0;
    
    return resultColor;
}
`;
