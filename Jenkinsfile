pipeline {
agent any

environment {
AWS_REGION = "ap-south-1"
ACCOUNT_ID = "453183019852"
IMAGE_NAME = "ihms-frontend"
IMAGE_TAG = "${BUILD_NUMBER}"
ECR = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
NEXUS_URL = "http://172.31.15.97:8081/repository/ihms-repo"
}

stages {

stage('Checkout') {
  steps {
    git branch: 'main',
        url: 'https://github.com/bk-thakur/ihms-frontend.git'
  }
}

stage('GitLeaks Secret Scan') {
  steps {
    sh '''
    gitleaks detect \
    --source . \
    --exit-code 1 \
    --report-format json \
    --report-path gitleaks-report.json
    '''
  }
}

stage('Archive GitLeaks Report') {
  steps {
    archiveArtifacts artifacts: 'gitleaks-report.json', allowEmptyArchive: true
  }
}

stage('Build Application') {
  steps {
    sh 'npm run build'
  }
}

stage('Create Build Artifact') {
  steps {
    sh 'zip -r build.zip build'
  }
}

stage('Upload Artifact to Nexus') {
  steps {
    withCredentials([usernamePassword(
      credentialsId: 'nexus-creds',
      usernameVariable: 'NEXUS_USER',
      passwordVariable: 'NEXUS_PASS'
    )]) {
      sh '''
      curl -v -u $NEXUS_USER:$NEXUS_PASS \
      --upload-file build.zip \
      ${NEXUS_URL}/build-${BUILD_NUMBER}.zip
      '''
    }
  }
}

stage('SonarQube Scan') {
  steps {
    withSonarQubeEnv('SonarQube-Server') {
      sh """
        /opt/sonar-scanner/bin/sonar-scanner \
        -Dsonar.projectKey=ihms-frontend \
        -Dsonar.sources=src
      """
    }
  }
}

stage('Quality Gate Check') {
  steps {
    timeout(time: 3, unit: 'MINUTES') {
      waitForQualityGate abortPipeline: true
    }
  }
}

stage('Docker Build') {
  steps {
    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
  }
}

stage('Login to ECR') {
  steps {
    sh """
      aws ecr get-login-password --region ${AWS_REGION} \
      | docker login --username AWS --password-stdin ${ECR}
    """
  }
}

stage('Tag & Push to ECR') {
  steps {
    sh """
      docker tag ${IMAGE_NAME}:${IMAGE_TAG} \
      ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}

      docker push ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}
    """
  }
}

stage('Trivy Scan') {
  steps {
    sh """
      docker pull ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}

      trivy image --exit-code 1 --severity HIGH,CRITICAL \
      ${ECR}/${IMAGE_NAME}:${IMAGE_TAG}
    """
  }
}

stage('Deploy to EKS') {
  steps {
    sh """
      aws eks update-kubeconfig \
      --region ${AWS_REGION} \
      --name ihms-cluster

      kubectl set image deployment/ihms-frontend \
      ihms=${ECR}/${IMAGE_NAME}:${IMAGE_TAG} \
      -n ihms

      kubectl rollout status deployment/ihms-frontend -n ihms
    """
  }
}

}

post {
success {
echo "Pipeline completed successfully"
}

failure {
  echo "Pipeline failed due to quality or security issue"
}

}
}
