pipeline {
  agent any
  tools {
    sonarQubeScanner 'SonarScanner'
  }


  environment {
    AWS_REGION = "ap-south-1"
    ACCOUNT_ID = "331760067638"
    IMAGE_NAME = "ihms-frontend"
    ECR = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    SONAR_HOST = "http://172.31.13.153 :9000"
    TRIVY_SERVER = "172.31.13.153"
  }
  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
        url: 'https://github.com/bk-thakur/ihms-frontend.git'
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
        withSonarQubeEnv('SonarQube-Server') {
          sh """
          sonar-scanner \
          -Dsonar.projectKey=ihms-frontend \
          -Dsonar.sources=src \
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
        sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .'
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
        aws ecr get-login-password --region $AWS_REGION \
        | docker login --username AWS --password-stdin $ECR
        '''
      }
    }

    stage('Tag & Push to ECR') {
      steps {
        sh '''
        docker tag $IMAGE_NAME:$BUILD_NUMBER \
        $ECR/$IMAGE_NAME:$BUILD_NUMBER

        docker push $ECR/$IMAGE_NAME:$BUILD_NUMBER
        '''
      }
    }

    stage('Remote Trivy Scan') {
      steps {
        sh """
        ssh -o StrictHostKeyChecking=no ubuntu@${TRIVY_SERVER} '

        aws ecr get-login-password --region ${AWS_REGION} | \
        docker login --username AWS --password-stdin ${ECR} &&

        docker pull ${ECR}/${IMAGE_NAME}:${BUILD_NUMBER} &&

        trivy image --exit-code 1 --severity HIGH,CRITICAL \
        ${ECR}/${IMAGE_NAME}:${BUILD_NUMBER}

        '
        """
      }
    }

    stage('Update Helm Repo (GitOps Trigger)') {
      steps {
        sh '''
        git clone https://github.com/bk-thakur/ihms-deploy.git
        cd ihms-deploy/environments/dev

        sed -i "s/tag:.*/tag: $BUILD_NUMBER/" values.yaml

        git config user.email "jenkins@ihms.com"
        git config user.name "jenkins"

        git commit -am "Updated image to $BUILD_NUMBER"
        git push
        '''
      }
    }
  }

  post {
    success {
      echo "Pipeline completed successfully 🚀"
    }
    failure {
      echo "Pipeline failed due to quality or security issue ❌"
    }
  }
}
