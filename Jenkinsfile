pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    ACCOUNT_ID = "123456789012"
    IMAGE_NAME = "ihms-frontend"
    ECR = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
        url: 'https://github.com/your-org/ihms-frontend-app.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Application') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube Scan') {
      steps {
        sh '''
        sonar-scanner         -Dsonar.projectKey=ihms-frontend         -Dsonar.sources=src         -Dsonar.host.url=http://YOUR-SONAR-IP:9000         -Dsonar.login=YOUR_SONAR_TOKEN
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .'
      }
    }

    stage('Trivy Scan Image') {
      steps {
        sh 'trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE_NAME:$BUILD_NUMBER'
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
        aws ecr get-login-password --region $AWS_REGION         | docker login --username AWS --password-stdin $ECR
        '''
      }
    }

    stage('Push to ECR') {
      steps {
        sh '''
        docker tag $IMAGE_NAME:$BUILD_NUMBER         $ECR/$IMAGE_NAME:$BUILD_NUMBER

        docker push $ECR/$IMAGE_NAME:$BUILD_NUMBER
        '''
      }
    }
  }
}
