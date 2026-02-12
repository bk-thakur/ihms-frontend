pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    ACCOUNT_ID = "123456789012"
    IMAGE_NAME = "ihms-frontend"
    ECR = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    SONAR_TOKEN = credentials('sonar-token')
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
        url: 'https://github.com/org/ihms-frontend-app.git'
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
        sh """
        sonar-scanner \
        -Dsonar.projectKey=ihms-frontend \
        -Dsonar.sources=src \
        -Dsonar.host.url=http://<SONAR-IP>:9000 \
        -Dsonar.login=$SONAR_TOKEN
        """
      }
    }

    stage('Quality Gate Check') {
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .'
      }
    }

    stage('Trivy Scan Image') {
      steps {
        sh '''
        trivy image --exit-code 1 --severity HIGH,CRITICAL \
        $IMAGE_NAME:$BUILD_NUMBER
        '''
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

    stage('Push to ECR') {
      steps {
        sh '''
        docker tag $IMAGE_NAME:$BUILD_NUMBER \
        $ECR/$IMAGE_NAME:$BUILD_NUMBER

        docker push $ECR/$IMAGE_NAME:$BUILD_NUMBER
        '''
      }
    }

    stage('Update Helm Repo') {
      steps {
        sh '''
        git clone https://github.com/org/ihms-deploy.git
        cd ihms-deploy/environments/dev
        sed -i "s/tag:.*/tag: $BUILD_NUMBER/" values.yaml
        git commit -am "Updated image to $BUILD_NUMBER"
        git push
        '''
      }
    }
  }
}

